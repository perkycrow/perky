import {parsePsd, layerToRGBA} from 'perky/io/psd.js'
import {createCanvas, canvasToBlob, putPixels, calculateResizeDimensions, resizeCanvas} from 'perky/io/canvas.js'
import ShelfPacker from 'perky/render/textures/shelf_packer.js'
import {toCamelCase} from 'perky/core/utils.js'


const ANIM_GROUP_PATTERN = /^anim[\s-]+(.+)$/i


const MAX_ATLAS_SIZE = 4096
const PADDING = 1


let currentPsd = null
let currentResult = null


const elements = {
    fileDrop: document.getElementById('file-drop'),
    fileInput: document.getElementById('file-input'),
    infoPanel: document.getElementById('info-panel'),
    infoDimensions: document.getElementById('info-dimensions'),
    infoProfile: document.getElementById('info-profile'),
    infoLayers: document.getElementById('info-layers'),
    infoAnimations: document.getElementById('info-animations'),
    p3Warning: document.getElementById('p3-warning'),
    animationsList: document.getElementById('animations-list'),
    settingsPanel: document.getElementById('settings-panel'),
    outputWidth: document.getElementById('output-width'),
    outputHeight: document.getElementById('output-height'),
    resizeMode: document.getElementById('resize-mode'),
    convertBtn: document.getElementById('convert-btn'),
    previewPanel: document.getElementById('preview-panel'),
    previewContainer: document.getElementById('preview-container'),
    downloadPng: document.getElementById('download-png'),
    downloadJson: document.getElementById('download-json')
}


function init () {
    elements.fileDrop.addEventListener('click', () => elements.fileInput.click())
    elements.fileInput.addEventListener('change', handleFileSelect)
    elements.fileDrop.addEventListener('dragover', handleDragOver)
    elements.fileDrop.addEventListener('dragleave', handleDragLeave)
    elements.fileDrop.addEventListener('drop', handleDrop)
    elements.convertBtn.addEventListener('click', handleConvert)
    elements.downloadPng.addEventListener('click', downloadPng)
    elements.downloadJson.addEventListener('click', downloadJson)
}


function handleDragOver (e) {
    e.preventDefault()
    elements.fileDrop.classList.add('dragover')
}


function handleDragLeave () {
    elements.fileDrop.classList.remove('dragover')
}


function handleDrop (e) {
    e.preventDefault()
    elements.fileDrop.classList.remove('dragover')
    const file = e.dataTransfer.files[0]
    if (file && file.name.endsWith('.psd')) {
        loadPsdFile(file)
    }
}


function handleFileSelect (e) {
    const file = e.target.files[0]
    if (file) {
        loadPsdFile(file)
    }
}


async function loadPsdFile (file) {
    const buffer = await file.arrayBuffer()
    const psd = parsePsd(new Uint8Array(buffer))

    currentPsd = {
        ...psd,
        filename: file.name.replace('.psd', '')
    }

    displayPsdInfo(psd)
}


function displayPsdInfo (psd) {
    elements.infoDimensions.textContent = `${psd.width} x ${psd.height}`
    elements.infoProfile.textContent = psd.colorProfile.name
    elements.infoLayers.textContent = psd.layers.length

    const animGroups = findAnimationGroups(psd.tree)
    const totalFrames = animGroups.reduce((sum, g) => sum + countFrames(g), 0)
    elements.infoAnimations.textContent = `${animGroups.length} (${totalFrames} frames)`

    if (psd.colorProfile.isP3) {
        elements.p3Warning.classList.remove('hidden')
    } else {
        elements.p3Warning.classList.add('hidden')
    }

    elements.animationsList.innerHTML = ''
    for (const group of animGroups) {
        const tag = document.createElement('div')
        tag.className = 'animation-tag'
        const name = parseAnimationName(group.name)
        const frameCount = countFrames(group)
        tag.innerHTML = `${name}<span>${frameCount}f</span>`
        elements.animationsList.appendChild(tag)
    }

    elements.outputWidth.value = ''
    elements.outputHeight.value = ''
    elements.outputWidth.placeholder = psd.width
    elements.outputHeight.placeholder = psd.height

    elements.infoPanel.classList.remove('hidden')
    elements.settingsPanel.classList.remove('hidden')
    elements.previewPanel.classList.add('hidden')
}


function isAnimationGroup (name) {
    return ANIM_GROUP_PATTERN.test(name)
}


function findAnimationGroups (tree) {
    const groups = []

    function traverse (nodes) {
        for (const node of nodes) {
            if (node.type === 'group') {
                if (isAnimationGroup(node.name)) {
                    groups.push(node)
                } else {
                    traverse(node.children)
                }
            }
        }
    }

    traverse(tree)
    return groups
}


function parseAnimationName (groupName) {
    const match = groupName.match(ANIM_GROUP_PATTERN)
    if (!match) return groupName

    const rawName = match[1].trim().toLowerCase()
    return toCamelCase(rawName)
}


function parseFrameNumber (layerName) {
    const match = layerName.match(/^(\d+)/)
    return match ? match[1] : null
}


function countFrames (group) {
    return group.children.filter(c => c.type === 'layer' && parseFrameNumber(c.name)).length
}


async function handleConvert () {
    if (!currentPsd) return

    elements.convertBtn.disabled = true
    elements.convertBtn.textContent = 'Converting...'
    elements.previewPanel.classList.remove('hidden')
    elements.previewContainer.innerHTML = '<p class="preview-placeholder">Converting...</p>'

    await new Promise(r => setTimeout(r, 50))

    try {
        const result = await convertPsd(currentPsd)
        currentResult = result
        displayPreview(result)
    } catch (error) {
        elements.previewContainer.innerHTML = `<p class="preview-placeholder">Error: ${error.message}</p>`
    }

    elements.convertBtn.disabled = false
    elements.convertBtn.textContent = 'Convert to Spritesheet'
}


async function convertPsd (psd) {
    const targetWidth = parseInt(elements.outputWidth.value, 10) || null
    const targetHeight = parseInt(elements.outputHeight.value, 10) || null
    const nearest = elements.resizeMode.value === 'nearest'

    const resize = calculateResizeDimensions(psd.width, psd.height, targetWidth, targetHeight)
    const needsResize = resize.width !== psd.width || resize.height !== psd.height

    const animGroups = findAnimationGroups(psd.tree)
    const frames = []
    const animations = {}

    for (const group of animGroups) {
        const animName = parseAnimationName(group.name)
        animations[animName] = []

        const layersWithFrameNumbers = []

        for (const child of group.children) {
            if (child.type !== 'layer') continue

            const frameNumber = parseFrameNumber(child.name)
            if (!frameNumber) continue

            layersWithFrameNumbers.push({
                layer: child.layer,
                name: child.name,
                frameNumber: parseInt(frameNumber, 10)
            })
        }

        layersWithFrameNumbers.sort((a, b) => a.frameNumber - b.frameNumber)

        for (const {layer, frameNumber} of layersWithFrameNumbers) {
            const filename = `${animName}/${frameNumber}`

            const rgba = layerToRGBA(layer, psd.width, psd.height)
            if (!rgba) continue

            let finalPixels = rgba.pixels
            let finalWidth = rgba.width
            let finalHeight = rgba.height

            if (needsResize) {
                const resized = await resizeFrame(rgba, resize.width, resize.height, nearest)
                finalPixels = resized.pixels
                finalWidth = resized.width
                finalHeight = resized.height
            }

            frames.push({
                filename,
                pixels: finalPixels,
                width: finalWidth,
                height: finalHeight,
                animName,
                frameNumber
            })

            animations[animName].push(filename)
        }
    }

    const atlases = packFramesIntoAtlases(frames, MAX_ATLAS_SIZE)

    for (let i = 0; i < atlases.length; i++) {
        const atlas = atlases[i]
        const usedHeight = atlas.packer.currentY
        atlas.finalHeight = nextPowerOfTwo(usedHeight)
        atlas.canvas = await compositeAtlas(atlas.frames, MAX_ATLAS_SIZE, atlas.finalHeight)
    }

    const jsonData = buildJsonData(atlases, animations, psd.filename)

    return {
        atlases,
        jsonData,
        filename: psd.filename
    }
}


async function resizeFrame (frameData, targetWidth, targetHeight, nearest) {
    const srcCanvas = await createCanvas(frameData.width, frameData.height)
    const srcCtx = srcCanvas.getContext('2d')
    putPixels(srcCtx, frameData.pixels, frameData.width, frameData.height)

    const resizedCanvas = await resizeCanvas(srcCanvas, targetWidth, targetHeight, nearest)
    const resizedCtx = resizedCanvas.getContext('2d')
    const imageData = resizedCtx.getImageData(0, 0, targetWidth, targetHeight)

    return {
        pixels: new Uint8Array(imageData.data.buffer),
        width: targetWidth,
        height: targetHeight
    }
}


function packFramesIntoAtlases (frames, atlasSize) {
    const atlases = []
    let currentAtlas = {
        packer: new ShelfPacker(atlasSize, atlasSize, PADDING),
        frames: []
    }
    atlases.push(currentAtlas)

    for (const frame of frames) {
        let slot = currentAtlas.packer.pack(frame.width, frame.height)

        if (!slot) {
            currentAtlas = {
                packer: new ShelfPacker(atlasSize, atlasSize, PADDING),
                frames: []
            }
            atlases.push(currentAtlas)
            slot = currentAtlas.packer.pack(frame.width, frame.height)

            if (!slot) {
                console.warn(`Frame too large: ${frame.filename}`)
                continue
            }
        }

        currentAtlas.frames.push({
            ...frame,
            x: slot.x,
            y: slot.y,
            atlasIndex: atlases.length - 1
        })
    }

    return atlases
}


async function compositeAtlas (packedFrames, atlasWidth, atlasHeight) {
    const canvas = await createCanvas(atlasWidth, atlasHeight)
    const ctx = canvas.getContext('2d')

    for (const frame of packedFrames) {
        putPixels(ctx, frame.pixels, frame.width, frame.height, frame.x, frame.y)
    }

    return canvas
}


function buildJsonData (atlases, animations, psdName) {
    const allFrames = []
    const images = []

    for (let i = 0; i < atlases.length; i++) {
        const atlas = atlases[i]
        const imageName = atlases.length === 1
            ? `${psdName}.png`
            : `${psdName}_${i}.png`

        images.push({
            filename: imageName,
            size: {
                w: MAX_ATLAS_SIZE,
                h: atlas.finalHeight
            }
        })

        for (const frame of atlas.frames) {
            allFrames.push({
                filename: frame.filename,
                frame: {
                    x: frame.x,
                    y: frame.y,
                    w: frame.width,
                    h: frame.height
                },
                sourceSize: {
                    w: frame.width,
                    h: frame.height
                },
                atlas: i
            })
        }
    }

    return {
        frames: allFrames,
        animations,
        meta: {
            app: 'perky-spritesheet',
            version: '1.0',
            images
        }
    }
}


function nextPowerOfTwo (n) {
    const powers = [16, 32, 64, 128, 256, 512, 1024, 2048, 4096]
    for (const p of powers) {
        if (p >= n) return p
    }
    return 4096
}


function displayPreview (result) {
    elements.previewContainer.innerHTML = ''

    for (const atlas of result.atlases) {
        const img = document.createElement('img')
        img.src = atlas.canvas.toDataURL('image/png')
        img.alt = 'Atlas preview'
        elements.previewContainer.appendChild(img)
    }
}


async function downloadPng () {
    if (!currentResult) return

    for (let i = 0; i < currentResult.atlases.length; i++) {
        const atlas = currentResult.atlases[i]
        const blob = await canvasToBlob(atlas.canvas)
        const filename = currentResult.atlases.length === 1
            ? `${currentResult.filename}.png`
            : `${currentResult.filename}_${i}.png`
        downloadBlob(blob, filename)
    }
}


function downloadJson () {
    if (!currentResult) return

    const json = JSON.stringify(currentResult.jsonData, null, 2)
    const blob = new Blob([json], {type: 'application/json'})
    downloadBlob(blob, `${currentResult.filename}.json`)
}


function downloadBlob (blob, filename) {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
}


if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
} else {
    init()
}
