import BinaryReader from './binary_reader.js'


const COLOR_MODES = {
    0: 'Bitmap',
    1: 'Grayscale',
    2: 'Indexed',
    3: 'RGB',
    4: 'CMYK',
    7: 'Multichannel',
    8: 'Duotone',
    9: 'Lab'
}


function readUtf16String (reader, byteLength) {
    const chars = []
    const charCount = byteLength / 2
    for (let i = 0; i < charCount; i++) {
        const charCode = reader.readUint16()
        if (charCode > 0) {
            chars.push(String.fromCharCode(charCode))
        }
    }
    return chars.join('')
}


function readProfileName (reader, startOffset, descOffset) {
    if (descOffset <= 0) {
        return 'Unknown'
    }

    reader.seek(startOffset + descOffset)
    const descType = reader.readString(4)

    if (descType === 'desc') {
        reader.skip(4)
        const strLength = reader.readUint32()
        return reader.readString(strLength - 1)
    }

    if (descType !== 'mluc') {
        return 'Unknown'
    }

    reader.skip(4)
    const recordCount = reader.readUint32()
    reader.skip(4)

    if (recordCount <= 0) {
        return 'Unknown'
    }

    reader.skip(4)
    const strLength = reader.readUint32()
    const strOffset = reader.readUint32()
    reader.seek(startOffset + descOffset + strOffset)

    return readUtf16String(reader, strLength)
}


function processRlePacket (reader, ctx) {
    const header = reader.readInt8()

    if (header >= 0) {
        const count = header + 1
        for (let i = 0; i < count && ctx.offset < ctx.rowEnd; i++) {
            ctx.output[ctx.offset++] = reader.readUint8()
        }
        return
    }

    if (header > -128) {
        const count = -header + 1
        const value = reader.readUint8()
        for (let i = 0; i < count && ctx.offset < ctx.rowEnd; i++) {
            ctx.output[ctx.offset++] = value
        }
    }
}


function copyPixelToRgba (rgba, dstIdx, channels, srcIdx) {
    rgba[dstIdx * 4] = channels.red ? channels.red[srcIdx] : 0
    rgba[dstIdx * 4 + 1] = channels.green ? channels.green[srcIdx] : 0
    rgba[dstIdx * 4 + 2] = channels.blue ? channels.blue[srcIdx] : 0
    rgba[dstIdx * 4 + 3] = channels.alpha ? channels.alpha[srcIdx] : 255
}


export function parsePsd (buffer) {
    const reader = new BinaryReader(buffer)

    const header = parseHeader(reader)
    skipColorModeData(reader)
    const colorProfile = parseImageResources(reader)
    const layers = parseLayerSection(reader)
    const tree = buildLayerTree(layers)
    const animations = findAnimations(tree)

    return {
        width: header.width,
        height: header.height,
        depth: header.depth,
        colorMode: header.colorMode,
        colorProfile,
        layers,
        tree,
        animations
    }
}


function parseHeader (reader) {
    const signature = reader.readString(4)
    if (signature !== '8BPS') {
        throw new Error(`Invalid PSD signature: ${signature}`)
    }

    const version = reader.readUint16()
    if (version !== 1 && version !== 2) {
        throw new Error(`Unsupported PSD version: ${version}`)
    }

    reader.skip(6)

    const channels = reader.readUint16()
    const height = reader.readUint32()
    const width = reader.readUint32()
    const depth = reader.readUint16()
    const colorMode = reader.readUint16()

    return {
        version: version === 1 ? 'PSD' : 'PSB',
        channels,
        width,
        height,
        depth,
        colorMode: COLOR_MODES[colorMode] || colorMode
    }
}


function skipColorModeData (reader) {
    const length = reader.readUint32()
    reader.skip(length)
}


function parseImageResources (reader) {
    const length = reader.readUint32()
    const endOffset = reader.offset + length

    let colorProfile = null

    while (reader.offset < endOffset) {
        const signature = reader.readString(4)
        if (signature !== '8BIM') {
            break
        }

        const resourceId = reader.readUint16()
        const nameLength = reader.readUint8()
        const namePadding = (nameLength + 1) % 2 === 0 ? 0 : 1
        reader.skip(nameLength + namePadding)

        const dataLength = reader.readUint32()
        const dataPadding = dataLength % 2 === 0 ? 0 : 1

        if (resourceId === 1039) {
            colorProfile = parseICCProfile(reader, dataLength)
            reader.skip(dataPadding)
        } else {
            reader.skip(dataLength + dataPadding)
        }
    }

    reader.seek(endOffset)
    return colorProfile || {name: 'sRGB', isP3: false}
}


function parseICCProfile (reader, length) {
    const startOffset = reader.offset

    reader.skip(4)
    reader.skip(4)
    reader.skip(4)
    reader.skip(4)
    const colorSpace = reader.readString(4).trim()

    reader.seek(startOffset + 128)

    const tagCount = reader.readUint32()
    let descOffset = 0

    for (let i = 0; i < tagCount; i++) {
        const tagSig = reader.readString(4)
        const tagOffset = reader.readUint32()
        reader.skip(4)

        if (tagSig === 'desc') {
            descOffset = tagOffset
            break
        }
    }

    const profileName = readProfileName(reader, startOffset, descOffset)

    reader.seek(startOffset + length)

    const nameLower = profileName.toLowerCase()
    const isP3 = nameLower.includes('p3') || nameLower.includes('display p3')
    const isSRGB = nameLower.includes('srgb')

    return {
        name: profileName,
        colorSpace,
        isP3,
        isSRGB
    }
}


function parseLayerSection (reader) {
    const sectionLength = reader.readUint32()
    if (sectionLength === 0) {
        return []
    }

    const sectionEnd = reader.offset + sectionLength
    const layerInfoLength = reader.readUint32()

    if (layerInfoLength === 0) {
        reader.seek(sectionEnd)
        return []
    }

    let layerCount = reader.readInt16()
    layerCount = Math.abs(layerCount)

    const layers = []

    for (let i = 0; i < layerCount; i++) {
        layers.push(parseLayerRecord(reader))
    }

    for (const layer of layers) {
        layer.channelData = parseChannelData(reader, layer)
    }

    reader.seek(sectionEnd)
    return layers
}


function parseLayerRecord (reader) {
    const top = reader.readInt32()
    const left = reader.readInt32()
    const bottom = reader.readInt32()
    const right = reader.readInt32()

    const channelCount = reader.readUint16()
    const channels = []

    for (let i = 0; i < channelCount; i++) {
        const id = reader.readInt16()
        const dataLength = reader.readUint32()
        channels.push({id, dataLength})
    }

    reader.skip(4) // blend signature
    const blendMode = reader.readString(4)
    const opacity = reader.readUint8()
    reader.skip(1) // clipping
    const flags = reader.readUint8()
    reader.skip(1) // filler

    const extraDataLength = reader.readUint32()
    const extraDataEnd = reader.offset + extraDataLength

    const maskDataLength = reader.readUint32()
    reader.skip(maskDataLength)

    const blendingRangesLength = reader.readUint32()
    reader.skip(blendingRangesLength)

    const name = readLayerName(reader)

    let isGroup = false
    let isGroupEnd = false
    let sectionType = 0

    while (reader.offset < extraDataEnd) {
        const sig = reader.readString(4)
        if (sig !== '8BIM' && sig !== '8B64') {
            reader.offset -= 4
            break
        }

        const key = reader.readString(4)
        const dataLength = reader.readUint32()
        const dataEnd = reader.offset + dataLength

        if (key === 'lsct' || key === 'lsdk') {
            sectionType = reader.readUint32()
            isGroup = sectionType === 1 || sectionType === 2
            isGroupEnd = sectionType === 3
        }

        reader.seek(dataEnd)
        if (dataLength % 2 !== 0) {
            reader.skip(1)
        }
    }

    reader.seek(extraDataEnd)

    return {
        name,
        top,
        left,
        bottom,
        right,
        width: right - left,
        height: bottom - top,
        channels,
        opacity,
        blendMode,
        isGroup,
        isGroupEnd,
        visible: (flags & 2) === 0
    }
}


function readLayerName (reader) {
    const length = reader.readUint8()
    const name = length > 0 ? reader.readString(length) : ''
    const padding = (4 - ((length + 1) % 4)) % 4
    reader.skip(padding)
    return name
}


function parseChannelData (reader, layer) {
    const channelData = {}

    for (const channel of layer.channels) {
        const compression = reader.readUint16()
        const dataLength = channel.dataLength - 2

        if (layer.width === 0 || layer.height === 0) {
            reader.skip(dataLength)
            continue
        }

        let pixels
        if (compression === 0) {
            pixels = reader.readBytes(dataLength)
        } else if (compression === 1) {
            pixels = decodeRLE(reader, layer.width, layer.height)
        } else {
            reader.skip(dataLength)
            continue
        }

        channelData[channel.id] = pixels
    }

    return channelData
}


function decodeRLE (reader, width, height) {
    for (let y = 0; y < height; y++) {
        reader.readUint16()
    }

    const output = new Uint8Array(width * height)
    const ctx = {output, offset: 0, rowEnd: 0}

    for (let y = 0; y < height; y++) {
        ctx.rowEnd = ctx.offset + width
        while (ctx.offset < ctx.rowEnd) {
            processRlePacket(reader, ctx)
        }
    }

    return output
}


function buildLayerTree (layers) {
    const root = {children: []}
    const stack = [root]

    for (let i = layers.length - 1; i >= 0; i--) {
        const layer = layers[i]
        const current = stack[stack.length - 1]

        if (!current) {
            continue
        }

        if (layer.isGroup) {
            const group = {
                type: 'group',
                name: layer.name,
                children: []
            }
            current.children.push(group)
            stack.push(group)
        } else if (layer.isGroupEnd) {
            if (stack.length > 1) {
                stack.pop()
            }
        } else {
            current.children.push({
                type: 'layer',
                name: layer.name,
                layer
            })
        }
    }

    return root.children
}


function findAnimations (tree) {
    const animations = {}

    function traverse (nodes) {
        for (const node of nodes) {
            if (node.type === 'group') {
                if (node.name.startsWith('anim - ')) {
                    const animName = node.name.replace('anim - ', '')
                    const frames = node.children
                        .filter(child => child.type === 'layer')
                        .map(child => child.layer)
                        .sort((a, b) => {
                            const numA = parseInt(a.name.match(/^(\d+)/)?.[1] || '0', 10)
                            const numB = parseInt(b.name.match(/^(\d+)/)?.[1] || '0', 10)
                            return numA - numB
                        })
                    animations[animName] = frames
                } else {
                    traverse(node.children)
                }
            }
        }
    }

    traverse(tree)
    return animations
}


export function layerToRGBA (layer, psdWidth, psdHeight, options = {}) {
    const {channelData, width, height, left, top} = layer
    const trim = options.trim ?? false

    if (width === 0 || height === 0) {
        return null
    }

    const channels = {
        red: channelData[0],
        green: channelData[1],
        blue: channelData[2],
        alpha: channelData[-1]
    }

    if (trim) {
        return createTrimmedRgba(channels, {width, height, left, top})
    }

    return createFullRgba(channels, layer, psdWidth, psdHeight)
}


function createTrimmedRgba (channels, bounds) {
    const {width, height, left, top} = bounds
    const rgba = new Uint8Array(width * height * 4)
    for (let i = 0; i < width * height; i++) {
        copyPixelToRgba(rgba, i, channels, i)
    }
    return {pixels: rgba, width, height, left, top}
}


function createFullRgba (channels, layer, psdWidth, psdHeight) {
    const rgba = new Uint8Array(psdWidth * psdHeight * 4)
    const ctx = {rgba, channels, layer, psdWidth, psdHeight}

    for (let ly = 0; ly < layer.height; ly++) {
        copyRowToRgba(ctx, ly)
    }

    return {pixels: rgba, width: psdWidth, height: psdHeight, left: 0, top: 0}
}


function copyRowToRgba (ctx, ly) {
    const {rgba, channels, layer, psdWidth, psdHeight} = ctx
    const {width, left, top} = layer
    const dstY = top + ly

    if (dstY < 0 || dstY >= psdHeight) {
        return
    }

    for (let lx = 0; lx < width; lx++) {
        const dstX = left + lx
        if (dstX < 0 || dstX >= psdWidth) {
            continue
        }

        const srcIdx = ly * width + lx
        const dstIdx = dstY * psdWidth + dstX
        copyPixelToRgba(rgba, dstIdx, channels, srcIdx)
    }
}
