import {doc, section, text, code, container, logger} from '../doc/runtime.js'
import GestureRecognizer from './gesture_recognizer.js'


export default doc('GestureRecognizer', () => {

    text(`
        Unified gesture recognition for pointer events. Handles taps, drags, pans,
        pinch-to-zoom, long press, and mouse wheel — all from a single class.
        Works with touch, mouse, and pen input.
    `)


    section('Basic Setup', () => {

        text(`
            Create a recognizer, attach it to an element, and listen for gesture events.
        `)

        code('Setup and events', () => {
            const element = document.createElement('div')
            const gestures = new GestureRecognizer(element)

            gestures.on('tap', ({x, y, pointerCount}) => {
                logger.log(`Tap at ${x}, ${y} with ${pointerCount} fingers`)
            })

            gestures.on('drag:start', ({x, y}) => {
                logger.log(`Drag started at ${x}, ${y}`)
            })

            gestures.on('drag:move', ({x, y, dx, dy}) => {
                logger.log(`Dragging: delta ${dx}, ${dy}`)
            })

            gestures.on('drag:end', () => {
                logger.log('Drag ended')
            })

            gestures.start()

            // Later: gestures.dispose()
        })

    })


    section('Gesture Events', () => {

        text(`
            The recognizer emits these events:

            - \`tap\` — Quick touch and release. Includes \`pointerCount\` for multi-finger taps.
            - \`doubletap\` — Two taps in quick succession.
            - \`longpress\` — Hold without moving.
            - \`drag:start\`, \`drag:move\`, \`drag:end\` — Single-pointer drag.
            - \`pan:start\`, \`pan:move\`, \`pan:end\` — Middle/right mouse button or multi-touch move.
            - \`pinch:start\`, \`pinch:move\`, \`pinch:end\` — Two-finger zoom gesture.
            - \`wheel\` — Mouse wheel scroll.
        `)

        code('Pinch to zoom', () => {
            const element = document.createElement('div')
            const gestures = new GestureRecognizer(element)

            let currentZoom = 1

            gestures.on('pinch:start', ({distance}) => {
                logger.log('Pinch started, distance:', distance)
            })

            gestures.on('pinch:move', ({scale, centerX, centerY}) => {
                currentZoom *= scale
                logger.log(`Zoom: ${currentZoom.toFixed(2)} centered at ${centerX}, ${centerY}`)
            })

            gestures.start()
        })

    })


    section('Configuration', () => {

        text(`
            Tune gesture thresholds via constructor parameters.
        `)

        code('Custom thresholds', () => {
            const element = document.createElement('div')

            const gestures = new GestureRecognizer(element, {
                tapThreshold: 15,          // Max movement for a tap (default: 10)
                tapMaxDuration: 400,       // Max tap duration in ms (default: 300)
                longPressDelay: 800,       // Long press threshold in ms (default: 500)
                dragThreshold: 10,         // Movement before drag starts (default: 5)
                doubleTapDelay: 400,       // Max time between taps (default: 300)
                preventDefaultEvents: true // Prevent browser defaults (default: true)
            })

            logger.log('Tap threshold:', gestures.tapThreshold)
            logger.log('Long press delay:', gestures.longPressDelay)
        })

    })


    section('Lifecycle', () => {

        text(`
            Call \`start()\` to attach listeners and \`stop()\` or \`dispose()\` to remove them.
            The recognizer sets \`touch-action: none\` on the element to prevent browser gestures.
        `)

        code('Start and stop', () => {
            const element = document.createElement('div')
            const gestures = new GestureRecognizer(element)

            gestures.start()
            logger.log('Element touch-action:', element.style.touchAction)

            logger.log('Gesture state:', gestures.gestureState)
            logger.log('Pointer count:', gestures.pointerCount)

            gestures.stop()
        })

    })


    section('Interactive Demo', () => {

        container({preset: 'interactive', height: 200}, (ctx) => {
            const gestures = new GestureRecognizer(ctx.container)
            const display = ctx.display(() => 'Tap, drag, or pinch here')

            gestures.on('tap', ({x, y, pointerCount}) => {
                display(`Tap (${pointerCount} finger${pointerCount > 1 ? 's' : ''})`)
            })

            gestures.on('doubletap', () => {
                display('Double tap!')
            })

            gestures.on('longpress', () => {
                display('Long press!')
            })

            gestures.on('drag:start', () => {
                display('Dragging...')
            })

            gestures.on('drag:end', () => {
                display('Drag ended')
            })

            gestures.on('pinch:move', ({scale}) => {
                display(`Pinch scale: ${scale.toFixed(2)}`)
            })

            gestures.on('wheel', ({deltaY}) => {
                display(`Wheel: ${deltaY > 0 ? 'down' : 'up'}`)
            })

            gestures.start()
        })

    })

})
