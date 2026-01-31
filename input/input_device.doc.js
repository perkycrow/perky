import {doc, section, text, code, action, logger} from '../doc/runtime.js'
import InputDevice from './input_device.js'
import ButtonControl from './input_controls/button_control.js'


export default doc('InputDevice', {advanced: true}, () => {

    text(`
        Base class for input devices. Manages a registry of controls and emits events
        when they change. Extended by [[KeyboardDevice@input]], [[MouseDevice@input]],
        and [[TouchDevice@input]].
    `)


    section('Registering Controls', () => {

        text(`
            Register controls on the device. Each control must have a unique name.
        `)

        action('Register and query', () => {
            const device = new InputDevice()

            const button = new ButtonControl({device, name: 'fire'})
            device.registerControl(button)

            logger.log('Has fire:', device.getControl('fire') !== undefined)
            logger.log('Value:', device.getValueFor('fire'))
        })

    })


    section('Press State', () => {

        text(`
            Track which controls are currently pressed and query their state.
        `)

        action('Check pressed state', () => {
            const device = new InputDevice()

            const jump = new ButtonControl({device, name: 'jump'})
            device.registerControl(jump)

            logger.log('Before press:', device.isPressed('jump'))

            jump.press()
            logger.log('After press:', device.isPressed('jump'))

            const pressed = device.getPressedControls()
            logger.log('Pressed controls:', pressed.map(c => c.name))
        })

    })


    section('Events', () => {

        text(`
            Devices emit \`control:pressed\`, \`control:released\`, and \`control:updated\`
            when their controls change.
        `)

        action('Listen for events', () => {
            const device = new InputDevice()

            device.on('control:pressed', (control) => {
                logger.log('Pressed:', control.name)
            })

            device.on('control:released', (control) => {
                logger.log('Released:', control.name)
            })

            const button = new ButtonControl({device, name: 'action'})
            device.registerControl(button)

            button.press()
            button.release()
        })

    })


    section('Find or Create', () => {

        text(`
            Use \`findOrCreateControl()\` to lazily create controls on first use.
            Returns the existing control if one with the same name is already registered.
        `)

        code('Lazy creation', () => {
            const device = new InputDevice()

            const control = device.findOrCreateControl(ButtonControl, {name: 'fire'})
            const same = device.findOrCreateControl(ButtonControl, {name: 'fire'})

            logger.log(control === same)  // true
        })

    })

})
