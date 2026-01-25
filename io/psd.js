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


export function parsePsd (buffer) {
    const reader = new BinaryReader(buffer)

    const header = parseHeader(reader)
    skipColorModeData(reader)
    skipImageResources(reader)
    const layers = parseLayerSection(reader)
    const tree = buildLayerTree(layers)
    const animations = findAnimations(tree)

    return {
        width: header.width,
        height: header.height,
        depth: header.depth,
        colorMode: header.colorMode,
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


function skipImageResources (reader) {
    const length = reader.readUint32()
    reader.skip(length)
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
    const rowLengths = []
    for (let y = 0; y < height; y++) {
        rowLengths.push(reader.readUint16())
    }

    const output = new Uint8Array(width * height)
    let outOffset = 0

    for (let y = 0; y < height; y++) {
        const rowEnd = outOffset + width
        while (outOffset < rowEnd) {
            const header = reader.readInt8()

            if (header >= 0) {
                const count = header + 1
                for (let i = 0; i < count && outOffset < rowEnd; i++) {
                    output[outOffset++] = reader.readUint8()
                }
            } else if (header > -128) {
                const count = -header + 1
                const value = reader.readUint8()
                for (let i = 0; i < count && outOffset < rowEnd; i++) {
                    output[outOffset++] = value
                }
            }
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

    const red = channelData[0]
    const green = channelData[1]
    const blue = channelData[2]
    const alpha = channelData[-1]

    if (trim) {
        const rgba = new Uint8Array(width * height * 4)
        for (let i = 0; i < width * height; i++) {
            rgba[i * 4] = red ? red[i] : 0
            rgba[i * 4 + 1] = green ? green[i] : 0
            rgba[i * 4 + 2] = blue ? blue[i] : 0
            rgba[i * 4 + 3] = alpha ? alpha[i] : 255
        }
        return {pixels: rgba, width, height, left, top}
    }

    const rgba = new Uint8Array(psdWidth * psdHeight * 4)

    for (let ly = 0; ly < height; ly++) {
        for (let lx = 0; lx < width; lx++) {
            const srcIdx = ly * width + lx
            const dstX = left + lx
            const dstY = top + ly

            if (dstX >= 0 && dstX < psdWidth && dstY >= 0 && dstY < psdHeight) {
                const dstIdx = dstY * psdWidth + dstX
                rgba[dstIdx * 4] = red ? red[srcIdx] : 0
                rgba[dstIdx * 4 + 1] = green ? green[srcIdx] : 0
                rgba[dstIdx * 4 + 2] = blue ? blue[srcIdx] : 0
                rgba[dstIdx * 4 + 3] = alpha ? alpha[srcIdx] : 255
            }
        }
    }

    return {
        pixels: rgba,
        width: psdWidth,
        height: psdHeight,
        left: 0,
        top: 0
    }
}
