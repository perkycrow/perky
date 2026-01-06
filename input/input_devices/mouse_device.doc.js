import {doc, section, text, code, container, logger} from '../../doc/runtime.js'
import MouseDevice from './mouse_device.js'


export default doc('MouseDevice', () => {

    text(`
        Mouse input device. Tracks button presses, cursor position, and wheel/trackpad navigation.
        Creates controls for left, right, middle, back, and forward buttons.
    `)


    section('Basic Setup', () => {

        text(`
            Create a MouseDevice attached to a container element.
            The device must be started to begin listening for events.
        `)

        code('Creation', () => {
            const mouse = new MouseDevice({
                container: document.body
            })

            mouse.start()
        })

        container({title: 'Mouse buttons', height: 150, preset: 'interactive'}, ctx => {
            ctx.hint('Click with different mouse buttons')
            const updateDisplay = ctx.display(name => name ?? '')

            const mouse = new MouseDevice({
                container: ctx.container
            })

            mouse.on('control:pressed', (control) => {
                if (control.name.includes('Button')) {
                    updateDisplay(control.name)
                    logger.log('pressed:', control.name)
                }
            })

            mouse.on('control:released', (control) => {
                if (control.name.includes('Button')) {
                    updateDisplay('')
                }
            })

            mouse.start()
            ctx.setApp(mouse)
        })

    })


    section('Position Tracking', () => {

        text(`
            The \`position\` control tracks cursor coordinates as a Vec2.
            Values are relative to the viewport (clientX/clientY).
        `)

        container({title: 'Cursor position', height: 200, preset: 'interactive-alt'}, ctx => {
            ctx.hint('Move cursor inside this area')
            const updateDisplay = ctx.display(pos => pos ?? '')

            const mouse = new MouseDevice({
                container: ctx.container
            })

            const positionControl = mouse.getControl('position')
            positionControl.on('updated', (pos) => {
                const rect = ctx.container.getBoundingClientRect()
                const localX = Math.round(pos.x - rect.left)
                const localY = Math.round(pos.y - rect.top)
                updateDisplay(`${localX}, ${localY}`)
            })

            mouse.start()
            ctx.setApp(mouse)
        })

    })


    section('Wheel & Navigation', () => {

        text(`
            The \`navigation\` control handles wheel events with delta values.
            It can distinguish between mouse wheel and trackpad gestures.
        `)

        container({title: 'Wheel events', height: 180, preset: 'interactive'}, ctx => {
            ctx.container.style.gap = '8px'

            const hint = document.createElement('div')
            hint.textContent = 'Scroll or use trackpad'
            hint.className = 'doc-hint'
            hint.style.marginBottom = '0'
            ctx.container.appendChild(hint)

            const deltaDisplay = document.createElement('div')
            deltaDisplay.style.fontSize = '18px'
            ctx.container.appendChild(deltaDisplay)

            const typeDisplay = document.createElement('div')
            typeDisplay.style.fontSize = '14px'
            typeDisplay.style.color = '#e94560'
            ctx.container.appendChild(typeDisplay)

            const mouse = new MouseDevice({
                container: ctx.container,
                shouldPreventDefault: true
            })

            const navControl = mouse.getControl('navigation')
            navControl.on('updated', () => {
                const dX = navControl.deltaX.toFixed(1)
                const dY = navControl.deltaY.toFixed(1)
                deltaDisplay.textContent = `deltaX: ${dX}  deltaY: ${dY}`

                if (navControl.isTrackpadPinchZoom) {
                    typeDisplay.textContent = 'trackpad pinch zoom'
                } else if (navControl.isTrackpadPan) {
                    typeDisplay.textContent = 'trackpad pan'
                } else if (navControl.isMouseWheelZoom) {
                    typeDisplay.textContent = 'mouse wheel'
                } else {
                    typeDisplay.textContent = ''
                }
            })

            mouse.start()
            ctx.setApp(mouse)
        })

        code('Navigation control API', () => {
            const mouse = new MouseDevice()
            const nav = mouse.getControl('navigation')

            // Delta values
            nav.deltaX
            nav.deltaY
            nav.deltaZ

            // Gesture detection
            nav.isTrackpadPinchZoom  // ctrl/cmd + scroll
            nav.isTrackpadPan        // two-finger scroll
            nav.isMouseWheelZoom     // vertical wheel only
        })

    })


    section('Prevent Default', () => {

        text(`
            Use \`shouldPreventDefault\` to block browser actions like context menu or scroll.
        `)

        code('Block context menu', () => {
            const mouse = new MouseDevice({
                shouldPreventDefault: (event, control) => {
                    return control.name === 'rightButton'
                }
            })
        })

        code('Block all', () => {
            const mouse = new MouseDevice({
                shouldPreventDefault: true
            })
        })

    })

})
