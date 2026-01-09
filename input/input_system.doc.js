import {doc, section, setup, text, code, action, container, logger} from '../doc/runtime.js'
import InputSystem from './input_system.js'
import PerkyModule from '../core/perky_module.js'
import PerkyView from '../application/perky_view.js'


export default doc('InputSystem', {context: 'simple'}, () => {

    text(`
        Manages input devices (keyboard, mouse, touch) and input bindings.
        Extends [[PerkyModule]] and delegates methods to its host when installed.
    `)


    section('Basic Usage', () => {

        text(`
            InputSystem is typically created as part of an [[Application]].
            When installed on a host with an element, it registers default devices:
            [[KeyboardDevice]], [[MouseDevice]], [[TouchDevice]].
        `)

        code('With Application', () => {
            // InputSystem is automatically created
            const app = new Application({$id: 'game'})

            // Access via the bound property
            app.inputSystem

            // Or access devices directly (also bound)
            app.keyboard
            app.mouse
            app.touch
        })

        code('Standalone', () => {
            // Create a host with an element
            const host = new PerkyModule({$id: 'host'})
            host.create(PerkyView, {$bind: 'perkyView'})

            // Create and install InputSystem
            const inputSystem = host.create(InputSystem, {
                $bind: 'inputSystem'
            })

            host.start()
        })

    })


    section('Checking Input State', () => {

        text('Query the current state of keys, mouse buttons, or touch points.')

        container({title: 'Keyboard state', height: 150, preset: 'interactive'}, ctx => {
            ctx.hint('Click here, then press keys')
            const updateDisplay = ctx.display(keys => (keys?.length ? keys : 'No keys pressed'))

            const host = new PerkyModule({$id: 'host'})
            const view = host.create(PerkyView, {
                $bind: 'perkyView',
                container: ctx.container
            })

            const inputSystem = host.create(InputSystem, {$bind: 'inputSystem'})
            host.start()

            const update = () => {
                const pressed = inputSystem.keyboard.getPressedControls()
                updateDisplay(pressed.map(c => c.name))
            }

            inputSystem.on('control:pressed', update)
            inputSystem.on('control:released', update)

            ctx.setApp(host)
        })

        code('Query methods', () => {
            // Check specific key/button
            app.isKeyPressed('Space')
            app.isMousePressed('left')
            app.isTouchPressed('touch0')

            // Check across all devices
            app.isPressedAny('Space')

            // Get control value (0 or 1 for buttons)
            app.getKeyValue('KeyW')
            app.getMouseValue('left')
        })

        code('Device methods', () => {
            // Check specific device
            inputSystem.isPressed('keyboard', 'Space')
            inputSystem.isPressed('mouse', 'left')
            inputSystem.isPressed('touch', 'touch0')

            // Get control value (0 or 1 for buttons)
            inputSystem.getValueFor('keyboard', 'KeyW')

            // Get all pressed controls from a device
            inputSystem.getPressedControls('keyboard')
        })

    })


    section('Input Bindings', () => {

        text(`
            Bind physical inputs to named actions.
            This decouples game logic from specific keys/buttons.
        `)

        container({title: 'Action bindings', height: 180, preset: 'interactive-alt'}, ctx => {
            ctx.hint('Press J to jump, K to kick')
            const updateDisplay = ctx.display(msg => msg || 'Waiting...')

            const host = new PerkyModule({$id: 'host'})
            host.create(PerkyView, {
                $bind: 'perkyView',
                container: ctx.container
            })

            const inputSystem = host.create(InputSystem, {$bind: 'inputSystem'})
            host.start()

            // Bind keys to actions
            host.bindInput({controlName: 'KeyJ', actionName: 'jump', eventType: 'pressed'})
            host.bindInput({controlName: 'KeyK', actionName: 'kick', eventType: 'pressed'})

            host.on('input:triggered', (binding) => {
                updateDisplay(`Action: ${binding.actionName}`)
                setTimeout(() => updateDisplay('Waiting...'), 500)
            })

            ctx.setApp(host)
        })

        code('bindInput / isActionPressed', () => {
            app.bindInput({
                controlName: 'Space',
                actionName: 'jump',
                eventType: 'pressed'
            })

            // Check if action is currently triggered
            if (app.isActionPressed('jump')) {
                player.jump()
            }

            // Check if binding exists
            app.hasBinding('jump') // true
        })

        code('Binding options', () => {
            // Basic binding
            inputSystem.bindInput({
                controlName: 'Space',
                actionName: 'jump',
                eventType: 'pressed' // or 'released'
            })

            // With device name (defaults to 'keyboard')
            inputSystem.bindInput({
                deviceName: 'mouse',
                controlName: 'left',
                actionName: 'shoot',
                eventType: 'pressed'
            })

            // With controller name (for multiplayer)
            inputSystem.bindInput({
                controlName: 'KeyW',
                actionName: 'moveUp',
                controllerName: 'player1'
            })
        })

    })


    section('Direction Helper', () => {

        text(`
            \`getDirection()\` returns a normalized [[Vec2]] based on action bindings.
            Expects actions named \`{name}Up\`, \`{name}Down\`, \`{name}Left\`, \`{name}Right\`.
        `)

        container({title: 'WASD direction', height: 180, preset: 'interactive'}, ctx => {
            ctx.hint('Use WASD or arrow keys')
            const updateDisplay = ctx.display(dir => dir || 'Direction: (0, 0)')

            const host = new PerkyModule({$id: 'host'})
            host.create(PerkyView, {
                $bind: 'perkyView',
                container: ctx.container
            })

            const inputSystem = host.create(InputSystem, {$bind: 'inputSystem'})
            host.start()

            // Bind WASD
            host.bindInput({controlName: 'KeyW', actionName: 'moveUp'})
            host.bindInput({controlName: 'KeyS', actionName: 'moveDown'})
            host.bindInput({controlName: 'KeyA', actionName: 'moveLeft'})
            host.bindInput({controlName: 'KeyD', actionName: 'moveRight'})

            // Bind arrows too
            host.bindInput({controlName: 'ArrowUp', actionName: 'moveUp'})
            host.bindInput({controlName: 'ArrowDown', actionName: 'moveDown'})
            host.bindInput({controlName: 'ArrowLeft', actionName: 'moveLeft'})
            host.bindInput({controlName: 'ArrowRight', actionName: 'moveRight'})

            const update = () => {
                const dir = host.getDirection('move')
                updateDisplay(`Direction: (${dir.x.toFixed(1)}, ${dir.y.toFixed(1)})`)
            }

            inputSystem.on('control:pressed', update)
            inputSystem.on('control:released', update)

            ctx.setApp(host)
        })

        code('Usage in game loop', () => {
            // In your game loop
            const dir = app.getDirection('move')

            player.x += dir.x * speed * deltaTime
            player.y += dir.y * speed * deltaTime
        })

    })


    section('Events', () => {

        text('Listen for input events at the device or action level.')

        code('Device events', () => {
            // Low-level: any control pressed/released
            inputSystem.on('control:pressed', (control, event, device) => {
                console.log(`${control.name} pressed on ${device.$id}`)
            })

            inputSystem.on('control:released', (control, event, device) => {
                console.log(`${control.name} released`)
            })
        })

        code('Action events', () => {
            // High-level: bound action triggered
            app.on('input:triggered', (binding, event, device) => {
                console.log(`Action: ${binding.actionName}`)

                if (binding.actionName === 'jump') {
                    player.jump()
                }
            })
        })

    })


    section('Managing Bindings', () => {

        text('Query and manage input bindings.')

        code('Binding queries', () => {
            app.bindInput({controlName: 'Space', actionName: 'jump'})
            app.bindInput({controlName: 'KeyW', actionName: 'moveUp'})

            app.hasBinding('jump')           // true
            app.getAllBindings()             // [binding1, binding2]
            app.getBindingsForAction('jump') // [binding1]
            app.getBindingsForInput({deviceName: 'keyboard', controlName: 'Space'})
        })

        code('Unbind / clear', () => {
            // Remove specific binding
            inputSystem.unbind('jump')

            // Clear all bindings
            inputSystem.clearBindings()
        })

    })


    section('Custom Devices', () => {

        text('Register additional input devices.')

        code('Register device', () => {
            // import GamepadDevice from './input_devices/gamepad_device.js'

            inputSystem.registerDevice(GamepadDevice, {
                $id: 'gamepad',
                $bind: 'gamepad'
            })

            // Now available
            inputSystem.isPressed('gamepad', 'button0')
        })

        code('Unregister device', () => {
            inputSystem.unregisterDevice('gamepad')
        })

    })

})
