import {doc, section, text, code} from '../../doc/runtime.js'


export default doc('Paint Engine', {advanced: true}, () => {

    text(`
        WebGL-based painting engine that handles brush strokes, layers, and
        compositing. Supports painting, erasing, and smudging with pressure
        sensitivity and stroke smoothing.
    `)


    section('Constructor', () => {

        text(`
            Creates a paint engine bound to a canvas element. Initializes
            WebGL context, shaders, and a default layer.
        `)

        code('Usage', () => {
            const canvas = document.querySelector('canvas')
            const engine = new PaintEngine(canvas)
        })

    })


    section('Brush Settings', () => {

        text(`
            Configure brush properties with \`setBrush()\`. Parameters include
            size, hardness, opacity, flow, spacing, smoothing, and color.
            Enable \`eraser\` or \`smudge\` mode for different behaviors.
        `)

        code('Usage', () => {
            engine.setBrush({
                size: 30,
                hardness: 0.9,
                opacity: 0.8,
                flow: 0.7,
                color: [1, 0, 0, 1]
            })

            engine.setBrush({eraser: true})
            engine.setBrush({smudge: true, smudgeStrength: 0.8})
        })

    })


    section('Stroke Input', () => {

        text(`
            Drive strokes with pointer events. \`beginStroke()\` starts at a
            point, \`continueStroke()\` adds samples along the path with
            interpolation, and \`endStroke()\` finalizes. All accept optional
            pressure values.
        `)

        code('Usage', () => {
            canvas.addEventListener('pointerdown', (e) => {
                engine.beginStroke(e.offsetX, e.offsetY, e.pressure)
            })

            canvas.addEventListener('pointermove', (e) => {
                engine.continueStroke(e.offsetX, e.offsetY, e.pressure)
            })

            canvas.addEventListener('pointerup', () => {
                engine.endStroke()
            })
        })

    })


    section('Layers', () => {

        text(`
            Manage layers with \`addLayer()\`, \`removeLayer()\`, and
            \`moveLayer()\`. Each layer has name, opacity, and visibility.
            Set the active layer with \`activeLayerIndex\`.
        `)

        code('Usage', () => {
            const index = engine.addLayer()
            engine.activeLayerIndex = index

            engine.setLayerName(index, 'Details')
            engine.setLayerOpacity(index, 0.8)
            engine.setLayerVisible(index, false)

            const info = engine.getLayerInfo(index)

            engine.moveLayer(0, 1)
            engine.removeLayer(index)
        })

    })


    section('Display', () => {

        text(`
            Call \`composite()\` to render all visible layers to the canvas.
            This happens automatically after strokes and layer changes.
            Use \`resize()\` when the canvas dimensions change.
        `)

        code('Usage', () => {
            engine.composite()
            engine.resize(window.innerWidth, window.innerHeight)
            engine.clear()
        })

    })


    section('dispose', () => {

        text(`
            Releases all WebGL resources including shaders, textures, and
            framebuffers. Call when the paint engine is no longer needed.
        `)

        code('Usage', () => {
            engine.dispose()
        })

    })

})
