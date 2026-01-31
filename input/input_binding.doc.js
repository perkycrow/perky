import {doc, section, text, code, action, logger} from '../doc/runtime.js'
import InputBinding from './input_binding.js'


export default doc('InputBinding', {advanced: true}, () => {

    text(`
        Data class for a single input binding. Maps a device+control pair to an action name.
        Used internally by [[InputBinder]] to store and match bindings.
    `)


    section('Creating a Binding', () => {

        text(`
            A binding connects a specific device control to a named action.
            The \`eventType\` defaults to \`'pressed'\`.
        `)

        code('Basic binding', () => {
            const binding = new InputBinding({
                deviceName: 'keyboard',
                controlName: 'Space',
                actionName: 'jump'
            })

            logger.log(binding.deviceName)   // 'keyboard'
            logger.log(binding.controlName)  // 'Space'
            logger.log(binding.actionName)   // 'jump'
            logger.log(binding.eventType)    // 'pressed'
        })

        code('With event type', () => {
            const binding = new InputBinding({
                deviceName: 'mouse',
                controlName: 'leftButton',
                actionName: 'shoot',
                eventType: 'released'
            })

            logger.log(binding.eventType)  // 'released'
        })

    })


    section('Binding Key', () => {

        text(`
            Each binding has a unique key based on its device, control, event type, and action.
            Used by [[InputBinder]] to avoid duplicate bindings.
        `)

        action('Key generation', () => {
            const binding = new InputBinding({
                deviceName: 'keyboard',
                controlName: 'KeyW',
                actionName: 'moveUp'
            })

            logger.log(binding.key)

            const withController = new InputBinding({
                deviceName: 'keyboard',
                controlName: 'KeyW',
                actionName: 'moveUp',
                controllerName: 'player1'
            })

            logger.log(withController.key)
        })

    })


    section('Matching', () => {

        text(`
            Use \`matches()\` to check if a binding corresponds to a given input event.
        `)

        action('Match check', () => {
            const binding = new InputBinding({
                deviceName: 'keyboard',
                controlName: 'Space',
                actionName: 'jump'
            })

            logger.log('Matches Space pressed:', binding.matches({
                deviceName: 'keyboard',
                controlName: 'Space',
                eventType: 'pressed'
            }))

            logger.log('Matches Space released:', binding.matches({
                deviceName: 'keyboard',
                controlName: 'Space',
                eventType: 'released'
            }))
        })

    })


    section('Updating Input', () => {

        text(`
            Rebind an existing binding to a different device and control
            using \`updateInput()\`.
        `)

        action('Rebind', () => {
            const binding = new InputBinding({
                deviceName: 'keyboard',
                controlName: 'Space',
                actionName: 'jump'
            })

            logger.log('Before:', binding.deviceName, binding.controlName)

            binding.updateInput({
                deviceName: 'keyboard',
                controlName: 'KeyW'
            })

            logger.log('After:', binding.deviceName, binding.controlName)
        })

    })

})
