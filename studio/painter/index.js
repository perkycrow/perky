import PaintEngine from './paint_engine.js'


const canvas = document.getElementById('canvas')
const engine = new PaintEngine(canvas)

const colorInput = document.getElementById('color')
const sizeInput = document.getElementById('size')
const hardnessInput = document.getElementById('hardness')
const opacityInput = document.getElementById('opacity')
const flowInput = document.getElementById('flow')
const smoothingInput = document.getElementById('smoothing')
const clearBtn = document.getElementById('clear')
const addLayerBtn = document.getElementById('add-layer')
const removeLayerBtn = document.getElementById('remove-layer')
const layerListEl = document.getElementById('layer-list')


function resize () {
    engine.resize(window.innerWidth, window.innerHeight)
}


function hexToRgb (hex) {
    const r = parseInt(hex.slice(1, 3), 16) / 255
    const g = parseInt(hex.slice(3, 5), 16) / 255
    const b = parseInt(hex.slice(5, 7), 16) / 255
    return [r, g, b, 1]
}


function updateBrush () {
    engine.setBrush({
        color: hexToRgb(colorInput.value),
        size: Number(sizeInput.value),
        hardness: Number(hardnessInput.value) / 100,
        opacity: Number(opacityInput.value) / 100,
        flow: Number(flowInput.value) / 100,
        smoothing: Number(smoothingInput.value) / 100
    })
}


function renderLayers () {
    layerListEl.innerHTML = ''
    for (let i = engine.layerCount - 1; i >= 0; i--) {
        const info = engine.getLayerInfo(i)
        const item = document.createElement('div')
        item.className = 'layer-item' + (i === engine.activeLayerIndex ? ' active' : '')

        const checkbox = document.createElement('input')
        checkbox.type = 'checkbox'
        checkbox.checked = info.visible
        checkbox.addEventListener('change', () => {
            engine.setLayerVisible(i, checkbox.checked)
        })

        const name = document.createElement('span')
        name.className = 'layer-name'
        name.textContent = info.name

        const opSlider = document.createElement('input')
        opSlider.type = 'range'
        opSlider.min = '0'
        opSlider.max = '100'
        opSlider.value = String(Math.round(info.opacity * 100))
        opSlider.addEventListener('input', () => {
            engine.setLayerOpacity(i, Number(opSlider.value) / 100)
        })

        item.addEventListener('click', (e) => {
            if (e.target === checkbox || e.target === opSlider) {
                return
            }
            engine.activeLayerIndex = i
            renderLayers()
        })

        item.appendChild(checkbox)
        item.appendChild(name)
        item.appendChild(opSlider)
        layerListEl.appendChild(item)
    }
}


resize()
updateBrush()
renderLayers()

window.addEventListener('resize', resize)
colorInput.addEventListener('input', updateBrush)
sizeInput.addEventListener('input', updateBrush)
hardnessInput.addEventListener('input', updateBrush)
opacityInput.addEventListener('input', updateBrush)
flowInput.addEventListener('input', updateBrush)
smoothingInput.addEventListener('input', updateBrush)
clearBtn.addEventListener('click', () => engine.clear())

addLayerBtn.addEventListener('click', () => {
    const index = engine.addLayer()
    engine.activeLayerIndex = index
    renderLayers()
})

removeLayerBtn.addEventListener('click', () => {
    engine.removeLayer(engine.activeLayerIndex)
    renderLayers()
})


let drawing = false

canvas.addEventListener('pointerdown', (e) => {
    if (e.target !== canvas) {
        return
    }
    drawing = true
    canvas.setPointerCapture(e.pointerId)
    engine.beginStroke(e.offsetX, e.offsetY, e.pressure || 0.5)
})


canvas.addEventListener('pointermove', (e) => {
    if (!drawing) {
        return
    }
    const events = e.getCoalescedEvents?.() || [e]
    for (const ev of events) {
        engine.continueStroke(ev.offsetX, ev.offsetY, ev.pressure || 0.5)
    }
})


canvas.addEventListener('pointerup', () => {
    drawing = false
    engine.endStroke()
})


canvas.addEventListener('pointercancel', () => {
    drawing = false
    engine.endStroke()
})
