import '../../../editor/number_input.js'


export function buildAnchorEditor (spritesheet, anchor, onChange) {
    const container = document.createElement('div')
    container.className = 'spritesheet-settings'

    const anchorSection = document.createElement('div')
    anchorSection.className = 'settings-section'

    const anchorLabel = document.createElement('div')
    anchorLabel.className = 'settings-label'
    anchorLabel.textContent = 'Anchor'
    anchorSection.appendChild(anchorLabel)

    const {wrapper, canvas, handle} = buildAnchorPreview(spritesheet, anchor, onChange)
    anchorSection.appendChild(wrapper)

    const {row, xInput, yInput} = buildAnchorInputs(anchor, (axis, value) => {
        anchor[axis] = value
        renderAnchorPreview(canvas, handle, anchor, getFirstFrameData(spritesheet))
        onChange?.(anchor)
    })
    anchorSection.appendChild(row)

    container.appendChild(anchorSection)

    return {
        container,
        syncInputs: () => {
            xInput.setValue(anchor.x)
            yInput.setValue(anchor.y)
        },
        updatePreview: () => {
            renderAnchorPreview(canvas, handle, anchor, getFirstFrameData(spritesheet))
        }
    }
}


export function buildAnchorPreview (spritesheet, anchor, onChange) {
    const wrapper = document.createElement('div')
    wrapper.className = 'anchor-preview-wrapper'

    const canvas = document.createElement('canvas')
    canvas.className = 'anchor-preview-canvas'
    wrapper.appendChild(canvas)

    const handle = document.createElement('div')
    handle.className = 'anchor-handle'
    wrapper.appendChild(handle)

    requestAnimationFrame(() => {
        const rect = wrapper.getBoundingClientRect()
        const size = Math.floor(rect.width)
        canvas.width = size
        canvas.height = size
        renderAnchorPreview(canvas, handle, anchor, getFirstFrameData(spritesheet))
    })

    setupAnchorDrag(wrapper, canvas, handle, anchor, onChange)

    return {wrapper, canvas, handle}
}


export function renderAnchorPreview (canvas, handle, anchor, frameData) {
    const ctx = canvas.getContext('2d')

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    if (!frameData) {
        return
    }

    const {image, region} = frameData
    const scale = Math.min(
        (canvas.width - 20) / region.width,
        (canvas.height - 20) / region.height
    )
    const drawWidth = region.width * scale
    const drawHeight = region.height * scale
    const offsetX = (canvas.width - drawWidth) / 2
    const offsetY = (canvas.height - drawHeight) / 2

    ctx.imageSmoothingEnabled = false
    ctx.drawImage(
        image,
        region.x, region.y, region.width, region.height,
        offsetX, offsetY, drawWidth, drawHeight
    )

    const anchorX = offsetX + anchor.x * drawWidth
    const anchorY = offsetY + (1 - anchor.y) * drawHeight

    handle.style.left = `${anchorX}px`
    handle.style.top = `${anchorY}px`

    handle.dataset.offsetX = offsetX
    handle.dataset.offsetY = offsetY
    handle.dataset.drawWidth = drawWidth
    handle.dataset.drawHeight = drawHeight
}


export function getFirstFrameData (spritesheet) {
    if (!spritesheet) {
        return null
    }

    const frames = spritesheet.getFrames()
    if (!frames.length) {
        return null
    }

    const firstFrame = frames[0]
    return {
        image: firstFrame.image,
        region: firstFrame.region
    }
}


export function setupAnchorDrag (wrapper, canvas, handle, anchor, onChange) {
    let isDragging = false

    const updateAnchor = (e) => {
        const rect = canvas.getBoundingClientRect()
        const offsetX = parseFloat(handle.dataset.offsetX) || 0
        const offsetY = parseFloat(handle.dataset.offsetY) || 0
        const drawWidth = parseFloat(handle.dataset.drawWidth) || 1
        const drawHeight = parseFloat(handle.dataset.drawHeight) || 1

        const x = e.clientX - rect.left
        const y = e.clientY - rect.top

        const anchorX = Math.max(0, Math.min(1, (x - offsetX) / drawWidth))
        const anchorY = Math.max(0, Math.min(1, 1 - (y - offsetY) / drawHeight))

        anchor.x = Math.round(anchorX * 100) / 100
        anchor.y = Math.round(anchorY * 100) / 100

        onChange?.(anchor)
    }

    handle.addEventListener('pointerdown', (e) => {
        isDragging = true
        handle.setPointerCapture(e.pointerId)
    })

    handle.addEventListener('pointermove', (e) => {
        if (isDragging) {
            updateAnchor(e)
        }
    })

    handle.addEventListener('pointerup', () => {
        isDragging = false
    })

    canvas.addEventListener('click', updateAnchor)
}


export function buildAnchorInputs (anchor, onChange) {
    const row = document.createElement('div')
    row.className = 'settings-row anchor-inputs'

    const xInput = document.createElement('number-input')
    xInput.setAttribute('context', 'studio')
    xInput.setLabel('X')
    xInput.setValue(anchor.x)
    xInput.setStep(0.01)
    xInput.setPrecision(2)
    xInput.setMin(0)
    xInput.setMax(1)
    xInput.addEventListener('change', (e) => {
        onChange?.('x', e.detail.value)
    })

    const yInput = document.createElement('number-input')
    yInput.setAttribute('context', 'studio')
    yInput.setLabel('Y')
    yInput.setValue(anchor.y)
    yInput.setStep(0.01)
    yInput.setPrecision(2)
    yInput.setMin(0)
    yInput.setMax(1)
    yInput.addEventListener('change', (e) => {
        onChange?.('y', e.detail.value)
    })

    row.appendChild(xInput)
    row.appendChild(yInput)

    return {row, xInput, yInput}
}
