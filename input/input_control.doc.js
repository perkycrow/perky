import {doc, section, text, code, logger} from '../doc/runtime.js'
import InputControl from './input_control.js'


export default doc('InputControl', () => {

    text(`
        Base class for input controls. Represents a single input value (button, axis, etc.)
        and notifies listeners when the value changes.
    `)


    section('Basic Usage', () => {

        text(`
            Create a control and listen for value changes.
        `)

        code('Simple control', () => {
            const control = new InputControl({
                device: null,
                name: 'jump',
                value: 0
            })

            control.on('updated', (newValue, oldValue) => {
                logger.log(`Value changed: ${oldValue} -> ${newValue}`)
            })

            control.setValue(1) // Triggers 'updated' event
        })

    })


    section('Value Management', () => {

        text(`
            Access current and previous values, or reset to default.
        `)

        code('Value tracking', () => {
            const control = new InputControl({
                device: null,
                name: 'axis',
                value: 0
            })

            control.setValue(0.5)
            control.setValue(0.8)

            logger.log(control.value)     // 0.8
            logger.log(control.oldValue)  // 0.5

            control.reset()
            logger.log(control.value)     // 0 (default value)
        })

    })

})
