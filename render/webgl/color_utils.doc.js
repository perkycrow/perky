import {doc, section, text, action, logger} from '../../doc/runtime.js'
import {parseColor} from './color_utils.js'


export default doc('ColorUtils', {advanced: true}, () => {

    text(`
        Utility for parsing color strings into normalized RGBA objects.
        Used internally by WebGL renderers to convert CSS-style colors into
        GPU-friendly values (0 to 1 range).
    `)


    section('Hex Colors', () => {

        text('Parses 6-digit hex strings into normalized RGBA.')

        action('Parse hex colors', () => {
            logger.log(parseColor('#ff0000'))
            logger.log(parseColor('#00ff00'))
            logger.log(parseColor('#ffffff'))
        })

    })


    section('HSL Colors', () => {

        text('Parses `hsl(h, s%, l%)` strings with automatic RGB conversion.')

        action('Parse HSL colors', () => {
            logger.log(parseColor('hsl(0, 100, 50)'))
            logger.log(parseColor('hsl(120, 50, 50)'))
            logger.log(parseColor('hsl(0, 0, 100)'))
        })

    })


    section('Fallback', () => {

        text('Unrecognized formats return black.')

        action('Invalid input', () => {
            logger.log(parseColor('not-a-color'))
        })

    })

})
