import {doc, section, text, code, action, logger} from '../doc/runtime.js'
import InputBinder from './input_binder.js'


export default doc('InputBinder', () => {

    text(`
        Maps device+control pairs to named actions. Used by [[InputSystem]] to
        decouple game logic from specific keys and buttons. Supports single bindings
        and composite (combo) bindings.
    `)


    section('Basic Binding', () => {

        text(`
            Bind a control to an action name. The device is auto-detected from the
            control name when not specified.
        `)

        action('Bind and query', () => {
            const binder = new InputBinder({$id: 'binder'})

            binder.bindInput({controlName: 'Space', actionName: 'jump'})
            binder.bindInput({controlName: 'KeyW', actionName: 'moveUp'})

            logger.log('Has jump:', binder.hasBinding({actionName: 'jump'}))
            logger.log('All bindings:', binder.getAllBindings().length)
        })

        code('With explicit device', () => {
            binder.bindInput({
                deviceName: 'mouse',
                controlName: 'leftButton',
                actionName: 'shoot',
                eventType: 'pressed'
            })
        })

    })


    section('Querying Bindings', () => {

        text('Look up bindings by action name or by input device+control.')

        action('Query methods', () => {
            const binder = new InputBinder({$id: 'binder'})
            binder.bindInput({controlName: 'Space', actionName: 'jump'})
            binder.bindInput({controlName: 'KeyW', actionName: 'moveUp'})
            binder.bindInput({controlName: 'ArrowUp', actionName: 'moveUp'})

            const jumpBindings = binder.getBindingsForAction('jump')
            logger.log('Jump bindings:', jumpBindings.length)

            const moveBindings = binder.getBindingsForAction('moveUp')
            logger.log('MoveUp bindings:', moveBindings.length)

            const spaceBindings = binder.getBindingsForInput({
                deviceName: 'keyboard',
                controlName: 'Space',
                eventType: 'pressed'
            })
            logger.log('Space bindings:', spaceBindings.length)
        })

    })


    section('Combo Bindings', () => {

        text(`
            Use \`bindCombo()\` to require multiple keys pressed simultaneously.
            The binding only triggers when all controls are active.
        `)

        action('Bind a combo', () => {
            const binder = new InputBinder({$id: 'binder'})

            binder.bindCombo(['ControlLeft', 'KeyS'], 'save')
            binder.bindCombo(['ShiftLeft', 'KeyZ'], 'undo')

            logger.log('Has save:', binder.hasBinding({actionName: 'save'}))
            logger.log('All bindings:', binder.getAllBindings().length)
        })

    })


    section('Unbinding', () => {

        text('Remove specific bindings or clear everything.')

        action('Unbind and clear', () => {
            const binder = new InputBinder({$id: 'binder'})
            binder.bindInput({controlName: 'Space', actionName: 'jump'})
            binder.bindInput({controlName: 'KeyW', actionName: 'moveUp'})

            logger.log('Before unbind:', binder.getAllBindings().length)

            binder.unbind({actionName: 'jump'})
            logger.log('After unbind:', binder.getAllBindings().length)

            binder.clearBindings()
            logger.log('After clear:', binder.getAllBindings().length)
        })

    })


    section('Import and Export', () => {

        text(`
            Serialize bindings to JSON-friendly format and restore them later.
            Useful for saving user-customized key mappings.
        `)

        action('Export and import', () => {
            const binder = new InputBinder({$id: 'binder'})
            binder.bindInput({controlName: 'Space', actionName: 'jump'})
            binder.bindInput({controlName: 'KeyW', actionName: 'moveUp'})

            const exported = binder.export()
            logger.log('Exported bindings:', exported.bindings.length)

            const binder2 = new InputBinder({$id: 'binder2', inputBinder: binder})
            logger.log('Imported bindings:', binder2.getAllBindings().length)
        })

    })


    section('Controller Names', () => {

        text(`
            Bindings can include a \`controllerName\` for multiplayer scenarios
            where different players share the same device.
        `)

        code('Multiplayer bindings', () => {
            binder.bindInput({
                controlName: 'KeyW',
                actionName: 'moveUp',
                controllerName: 'player1'
            })

            binder.bindInput({
                controlName: 'ArrowUp',
                actionName: 'moveUp',
                controllerName: 'player2'
            })

            // Query for a specific controller
            binder.getBindingsForAction('moveUp', 'player1')
        })

    })

})
