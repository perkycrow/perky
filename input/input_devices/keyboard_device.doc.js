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

        container({title: 'Interactive keyboard', height: 150, preset: 'interactive'}, ctx => {
            ctx.container.style.cursor = 'pointer'
            ctx.hint('Click here, then press keys')
            const updateDisplay = ctx.display(name => name ?? '')

            const keyboard = new KeyboardDevice({
                container: ctx.container
            })

            keyboard.on('control:pressed', (control) => {
                updateDisplay(control.name)
                logger.log('pressed:', control.name)
            })

            keyboard.on('control:released', () => {
                updateDisplay('')
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

        container({title: 'Key codes', height: 150, preset: 'interactive-alt'}, ctx => {
            ctx.hint('Press any key to see its code')
            const updateDisplay = ctx.display(name => name ?? '')

            const keyboard = new KeyboardDevice({
                container: ctx.container
            })

            keyboard.on('control:pressed', (control) => {
                updateDisplay(control.name)
            })

            keyboard.start()
            ctx.setApp(keyboard)
        })

    })


    section('Querying State', () => {

        text('Check if specific keys are pressed or get all pressed keys.')

        container({title: 'Multiple keys', height: 180, preset: 'interactive'}, ctx => {
            ctx.hint('Hold multiple keys')

            const keyboard = new KeyboardDevice({
                container: ctx.container
            })

            const updateDisplay = ctx.display(() => {
                return keyboard.getPressedControls().map(c => c.name)
            })

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
