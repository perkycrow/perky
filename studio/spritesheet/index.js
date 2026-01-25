import {parsePsd} from 'perky/io/psd.js'
import {canvasToBlob, calculateResizeDimensions} from 'perky/io/canvas.js'
import {
    findAnimationGroups,
    parseAnimationName,
    countFrames,
    extractFramesFromGroup,
    resizeFrames,
    packFramesIntoAtlases,
    compositeAtlas,
    nextPowerOfTwo,
    buildJsonData,
    MAX_ATLAS_SIZE
} from 'perky/io/spritesheet.js'


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


async function handleConvert () {
    if (!currentPsd) {
        return
    }

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

    const animGroups = findAnimationGroups(psd.tree)
    let frames = []
    const animations = {}

    for (const group of animGroups) {
        const animName = parseAnimationName(group.name)
        const groupFrames = extractFramesFromGroup(group, psd.width, psd.height)

        frames = frames.concat(groupFrames)
        animations[animName] = groupFrames.map(f => f.filename)
    }

    frames = await resizeFrames(frames, psd.width, psd.height, resize.width, resize.height, nearest)

    const atlases = packFramesIntoAtlases(frames, MAX_ATLAS_SIZE)

    for (const atlas of atlases) {
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
    if (!currentResult) {
        return
    }

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
    if (!currentResult) {
        return
    }

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
