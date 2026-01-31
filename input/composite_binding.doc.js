import {doc, section, text, code, action, logger} from '../doc/runtime.js'
import CompositeBinding from './composite_binding.js'


export default doc('CompositeBinding', {advanced: true}, () => {

    text(`
        Binding for key combos. Extends [[InputBinding]] to require multiple controls
        pressed simultaneously before triggering. Created by [[InputBinder]]'s
        \`bindCombo()\` method.
    `)


    section('Creating a Combo', () => {

        text(`
            Specify an array of at least 2 controls that must all be active
            for the binding to trigger.
        `)

        code('Ctrl+S combo', () => {
            const binding = new CompositeBinding({
                controls: [
                    {deviceName: 'keyboard', controlName: 'ControlLeft'},
                    {deviceName: 'keyboard', controlName: 'KeyS'}
                ],
                actionName: 'save'
            })

            logger.log(binding.controlName)
            logger.log(binding.actionName)
        })

    })


    section('Control Name Generation', () => {

        text(`
            The composite control name is generated from all included controls,
            making each combo uniquely identifiable.
        `)

        action('Generated name', () => {
            const name = CompositeBinding.generateControlName([
                {deviceName: 'keyboard', controlName: 'ShiftLeft'},
                {deviceName: 'keyboard', controlName: 'KeyZ'}
            ])

            logger.log(name)
        })

    })


    section('Matching', () => {

        text(`
            A composite binding matches if the event comes from any of its controls
            and the event type matches.
        `)

        action('Match against input', () => {
            const binding = new CompositeBinding({
                controls: [
                    {deviceName: 'keyboard', controlName: 'ControlLeft'},
                    {deviceName: 'keyboard', controlName: 'KeyS'}
                ],
                actionName: 'save'
            })

            logger.log('Matches ControlLeft:', binding.matches({
                deviceName: 'keyboard',
                controlName: 'ControlLeft',
                eventType: 'pressed'
            }))

            logger.log('Matches KeyA:', binding.matches({
                deviceName: 'keyboard',
                controlName: 'KeyA',
                eventType: 'pressed'
            }))
        })

    })

})
