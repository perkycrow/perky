import {doc, section, text, code, container} from '../../doc/runtime.js'
import TouchDevice from './touch_device.js'


export default doc('TouchDevice', {advanced: true}, () => {

    text(`
        Touch input device for mobile and touch-enabled screens.
        Provides controls for position tracking, swipe gestures, and tap detection.
    `)


    section('Basic Setup', () => {

        text(`
            Create a TouchDevice attached to a container element.
            The device must be started to begin listening for events.
        `)

        code('Creation', () => {
            const touch = new TouchDevice({
                container: document.body
            })

            touch.start()
        })

        container({title: 'Interactive touch area', height: 200, preset: 'interactive'}, ctx => {
            ctx.hint('Touch and drag')

            const touch = new TouchDevice({
                container: ctx.container
            })

            const marker = ctx.marker(0, 0)
            marker.style.opacity = '0'
            marker.style.transition = 'opacity 0.2s'

            touch.on('control:updated', (control) => {
                if (control.name === 'position') {
                    const rect = ctx.container.getBoundingClientRect()
                    marker.style.left = (control.value.x - rect.left) + 'px'
                    marker.style.top = (control.value.y - rect.top) + 'px'
                    marker.style.opacity = '1'
                }
            })

            touch.getControl('swipeUp').on('pressed', () => {
                marker.style.background = '#4aff4a'
            })

            touch.getControl('swipeDown').on('pressed', () => {
                marker.style.background = '#ff4a4a'
            })

            touch.getControl('swipeUp').on('released', () => {
                marker.style.background = '#4a9eff'
            })

            touch.getControl('swipeDown').on('released', () => {
                marker.style.background = '#4a9eff'
            })

            touch.start()
            ctx.setApp(touch)
        })

    })


    section('Controls', () => {

        text(`
            TouchDevice creates five controls:

            - \`position\` - [[Vec2Control]] with current touch coordinates
            - \`delta\` - [[Vec2Control]] with movement since last update
            - \`swipeUp\` - [[ButtonControl@input]] triggered on upward swipe
            - \`swipeDown\` - [[ButtonControl@input]] triggered on downward swipe
            - \`tap\` - [[ButtonControl@input]] triggered on quick tap
        `)

        container({title: 'Swipe detection', height: 200, preset: 'interactive-alt'}, ctx => {
            ctx.hint('Swipe up or down')
            const updateDisplay = ctx.display(t => t || 'Waiting...')

            const touch = new TouchDevice({
                container: ctx.container
            })

            touch.getControl('swipeUp').on('pressed', () => {
                updateDisplay('Swipe UP')
            })

            touch.getControl('swipeDown').on('pressed', () => {
                updateDisplay('Swipe DOWN')
            })

            touch.start()
            ctx.setApp(touch)
        })

        container({title: 'Tap detection', height: 150, preset: 'interactive'}, ctx => {
            ctx.hint('Tap quickly')
            let count = 0
            const updateDisplay = ctx.display(() => `Taps: ${count}`)

            const touch = new TouchDevice({
                container: ctx.container
            })

            touch.getControl('tap').on('pressed', () => {
                count++
                updateDisplay()
            })

            touch.start()
            ctx.setApp(touch)
        })

    })


    section('Configuration', () => {

        text(`
            Customize thresholds for swipe and tap detection.
        `)

        code('Thresholds', () => {
            const touch = new TouchDevice({
                container: document.body,
                swipeThreshold: 30,   // Pixels to trigger swipe (default: 30)
                tapThreshold: 20,     // Max movement for tap (default: 20)
                tapMaxDuration: 300   // Max tap duration in ms (default: 300)
            })
        })

        code('Prevent default', () => {
            // Prevent all touch defaults (scrolling, etc.)
            const touch = new TouchDevice({
                container: document.body,
                shouldPreventDefault: true
            })
        })

        code('Selective prevention', () => {
            const touch = new TouchDevice({
                container: document.body,
                shouldPreventDefault: (event, control) => {
                    // Only prevent default for position tracking
                    return control.name === 'position'
                }
            })
        })

    })


    section('Events', () => {

        text('Listen for control events to react to touch input.')

        code('Position tracking', () => {
            const touch = new TouchDevice({
                container: document.body
            })

            const position = touch.getControl('position')

            position.on('updated', () => {
                logger.log('Touch at:', position.value.x, position.value.y)
            })

            touch.start()
        })

        code('Gesture events', () => {
            const touch = new TouchDevice({
                container: document.body
            })

            touch.on('control:pressed', (control) => {
                if (control.name === 'swipeUp') {
                    logger.log('Swiped up!')
                }
                if (control.name === 'tap') {
                    logger.log('Tapped!')
                }
            })

            touch.start()
        })

    })

})
