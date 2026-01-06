import {doc, section, text, code, container, logger} from '../../doc/runtime.js'
import KeyboardDevice from './keyboard_device.js'


export default doc('KeyboardDevice', () => {

    text(`
        Keyboard input device. Listens for keydown/keyup events and creates
        ButtonControl instances dynamically for each key pressed.
    `)


    section('Basic Setup', () => {

        text(`
            Create a KeyboardDevice attached to a container element.
            The device must be started to begin listening for events.
        `)

        code('Creation', () => {
            const keyboard = new KeyboardDevice({
                container: document.body
            })

            keyboard.start()
        })

        container({title: 'Interactive keyboard', width: 400, height: 150, preset: 'interactive'}, ctx => {
            ctx.container.style.cursor = 'pointer'

            const hint = document.createElement('div')
            hint.textContent = 'Click here, then press keys'
            hint.className = 'doc-hint'
            ctx.container.appendChild(hint)

            const display = document.createElement('div')
            display.className = 'doc-display'
            ctx.container.appendChild(display)

            const keyboard = new KeyboardDevice({
                container: ctx.container
            })

            keyboard.on('control:pressed', (control) => {
                display.textContent = control.name
                logger.log('pressed:', control.name)
            })

            keyboard.on('control:released', (control) => {
                display.textContent = ''
                logger.log('released:', control.name)
            })

            keyboard.start()
            ctx.setApp(keyboard)
        })

    })


    section('Key Names', () => {

        text(`
            Keys are identified by their \`event.code\` value (physical key position).
            Examples: \`KeyA\`, \`Space\`, \`ArrowUp\`, \`ShiftLeft\`.
        `)

        container({title: 'Key codes', width: 400, height: 150, preset: 'interactive-alt'}, ctx => {
            const hint = document.createElement('div')
            hint.textContent = 'Press any key to see its code'
            hint.className = 'doc-hint'
            ctx.container.appendChild(hint)

            const codeDisplay = document.createElement('div')
            codeDisplay.className = 'doc-display-alt'
            ctx.container.appendChild(codeDisplay)

            const keyboard = new KeyboardDevice({
                container: ctx.container
            })

            keyboard.on('control:pressed', (control) => {
                codeDisplay.textContent = control.name
            })

            keyboard.start()
            ctx.setApp(keyboard)
        })

    })


    section('Querying State', () => {

        text('Check if specific keys are pressed or get all pressed keys.')

        container({title: 'Multiple keys', width: 400, height: 180, preset: 'interactive'}, ctx => {
            ctx.container.style.gap = '12px'

            const hint = document.createElement('div')
            hint.textContent = 'Hold multiple keys'
            hint.className = 'doc-hint'
            hint.style.marginBottom = '0'
            ctx.container.appendChild(hint)

            const display = document.createElement('div')
            display.style.fontSize = '16px'
            display.style.textAlign = 'center'
            display.style.minHeight = '48px'
            ctx.container.appendChild(display)

            const keyboard = new KeyboardDevice({
                container: ctx.container
            })

            const updateDisplay = () => {
                const pressed = keyboard.getPressedControls()
                if (pressed.length > 0) {
                    display.innerHTML = pressed.map(c =>
                        `<span style="background:#e94560;padding:4px 8px;margin:2px;border-radius:4px">${c.name}</span>`).join('')
                } else {
                    display.textContent = ''
                }
            }

            keyboard.on('control:pressed', updateDisplay)
            keyboard.on('control:released', updateDisplay)

            keyboard.start()
            ctx.setApp(keyboard)
        })

        code('API methods', () => {
            const keyboard = new KeyboardDevice()
            keyboard.start()

            // Check single key
            const isSpacePressed = keyboard.isPressed('Space')

            // Get all pressed
            const pressedControls = keyboard.getPressedControls()

            // Get control value (0 or 1 for buttons)
            const value = keyboard.getValueFor('KeyW')
        })

    })


    section('Prevent Default', () => {

        text(`
            Use \`shouldPreventDefault\` to stop browser default behavior.
            Can be a boolean or a function for fine-grained control.
        `)

        code('Prevent all', () => {
            const keyboard = new KeyboardDevice({
                shouldPreventDefault: true
            })
        })

        code('Selective prevention', () => {
            const keyboard = new KeyboardDevice({
                shouldPreventDefault: (event, control) => {
                    // Only prevent arrow keys and space
                    return ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space']
                        .includes(control.name)
                }
            })
        })

    })

})
