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


function resize () {
    engine.resize(window.innerWidth, window.innerHeight)
    engine.clear()
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


resize()
updateBrush()

window.addEventListener('resize', resize)
colorInput.addEventListener('input', updateBrush)
sizeInput.addEventListener('input', updateBrush)
hardnessInput.addEventListener('input', updateBrush)
opacityInput.addEventListener('input', updateBrush)
flowInput.addEventListener('input', updateBrush)
smoothingInput.addEventListener('input', updateBrush)
clearBtn.addEventListener('click', () => engine.clear())


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
