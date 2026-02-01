import {doc, section, text, code, action, logger} from '../doc/runtime.js'
import GamepadInfo from './gamepad_info.js'


export default doc('GamepadInfo', {advanced: true}, () => {

    text(`
        Parses raw gamepad ID strings to detect controller type and model.
        Handles format differences between Chrome and Firefox.
    `)


    section('Basic Usage', () => {

        text(`
            Pass a gamepad's raw ID string to get vendor, type, and model information.
        `)

        action('Parse a gamepad ID', () => {
            const info = new GamepadInfo('Xbox 360 Controller (STANDARD GAMEPAD Vendor: 045e Product: 028e)')

            logger.log('Type:', info.type)
            logger.log('Vendor:', info.vendor)
            logger.log('Product:', info.product)
            logger.log('Name:', info.name)
        })

    })


    section('Controller Types', () => {

        text(`
            Detected types include \`xbox\`, \`ps3\`, \`ps4\`, \`ps5\`, \`switch\`,
            \`logitech\`, \`8bitdo\`, \`generic\`, and \`unknown\`.
        `)

        action('PlayStation detection', () => {
            const ps5 = new GamepadInfo('DualSense Wireless Controller (STANDARD GAMEPAD Vendor: 054c Product: 0ce6)')
            logger.log('Type:', ps5.type)
            logger.log('Model:', ps5.model)

            const ps4 = new GamepadInfo('054c-09cc-Sony Interactive Entertainment Wireless Controller')
            logger.log('Type:', ps4.type)
            logger.log('Model:', ps4.model)
        })

        action('Nintendo detection', () => {
            const info = new GamepadInfo('057e-2009-Pro Controller')
            logger.log('Type:', info.type)
            logger.log('Name:', info.name)
        })

    })


    section('Browser Formats', () => {

        text(`
            Chrome and Firefox report gamepad IDs differently. GamepadInfo handles both.
        `)

        code('Chrome format', () => {
            // Chrome: "Name (STANDARD GAMEPAD Vendor: XXXX Product: XXXX)"
            const info = new GamepadInfo('Xbox 360 Controller (STANDARD GAMEPAD Vendor: 045e Product: 028e)')
            logger.log(info.vendor)  // '045e'
        })

        code('Firefox format', () => {
            // Firefox: "XXXX-XXXX-Name"
            const info = new GamepadInfo('045e-028e-Xbox 360 Controller')
            logger.log(info.vendor)  // '045e'
        })

    })


    section('Edge Cases', () => {

        text(`
            Missing or invalid IDs produce an \`unknown\` type.
            Unrecognized strings fall back to \`generic\`.
        `)

        action('Invalid input', () => {
            const empty = new GamepadInfo(null)
            logger.log('Null:', empty.type)

            const unknown = new GamepadInfo('Some Random Controller')
            logger.log('Unrecognized:', unknown.type)
        })

    })

})
