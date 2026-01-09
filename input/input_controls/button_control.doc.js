import {doc, section, text, code, action, logger} from '../../doc/runtime.js'
import ButtonControl from './button_control.js'


export default doc('ButtonControl', () => {

    text(`
        Input control for binary button states (pressed/released).
        Extends [[InputControl]] with press detection and threshold support.
    `)


    section('Basic Usage', () => {

        text(`
            Create a button control and listen for press/release events.
        `)

        code('Creation', () => {
            const button = new ButtonControl({
                device: null,
                name: 'jump'
            })

            button.on('pressed', () => {
                logger.log('Button pressed!')
            })

            button.on('released', () => {
                logger.log('Button released!')
            })
        })

        action('Press and release', () => {
            const button = new ButtonControl({
                device: null,
                name: 'action'
            })

            button.on('pressed', () => logger.log('pressed'))
            button.on('released', () => logger.log('released'))

            logger.log('Pressing...')
            button.press()
            logger.log('isPressed:', button.isPressed)

            logger.log('Releasing...')
            button.release()
            logger.log('isPressed:', button.isPressed)
        })

    })


    section('Value and State', () => {

        text(`
            Button values range from 0 (released) to 1 (fully pressed).
            The \`isPressed\` state is determined by comparing the value to the \`pressThreshold\`.
        `)

        action('Value changes', () => {
            const button = new ButtonControl({
                device: null,
                name: 'trigger'
            })

            button.on('updated', (newValue, oldValue) => {
                logger.log(`Value: ${oldValue} -> ${newValue}`)
            })

            button.setValue(0.5)
            logger.log('isPressed at 0.5:', button.isPressed)

            button.setValue(1)
            logger.log('isPressed at 1:', button.isPressed)

            button.setValue(0)
            logger.log('isPressed at 0:', button.isPressed)
        })

        action('wasPressed tracking', () => {
            const button = new ButtonControl({
                device: null,
                name: 'test'
            })

            button.setValue(1)
            logger.log('After press - isPressed:', button.isPressed, 'wasPressed:', button.wasPressed)

            button.setValue(0)
            logger.log('After release - isPressed:', button.isPressed, 'wasPressed:', button.wasPressed)
        })

    })


    section('Press Threshold', () => {

        text(`
            The \`pressThreshold\` determines when a button is considered pressed.
            Default is 0.1. Useful for analog triggers or pressure-sensitive inputs.
        `)

        action('Custom threshold', () => {
            const button = new ButtonControl({
                device: null,
                name: 'analog',
                pressThreshold: 0.5
            })

            button.setValue(0.3)
            logger.log('Value 0.3, threshold 0.5:', button.isPressed)

            button.setValue(0.6)
            logger.log('Value 0.6, threshold 0.5:', button.isPressed)
        })

        code('Static default', () => {
            // Change default for all new buttons
            ButtonControl.defaultPressThreshold = 0.2

            const button = new ButtonControl({
                device: null,
                name: 'test'
            })
            // button.pressThreshold is now 0.2
        })

    })

})
