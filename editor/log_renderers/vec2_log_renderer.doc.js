import {doc, section, text, code, action, logger} from '../../doc/runtime.js'
import Vec2 from '../../math/vec2.js'
import './vec2_log_renderer.js'


export default doc('Vec2LogRenderer', {advanced: true}, () => {

    text(`
        Custom log renderer for [[Vec2@math]] objects. Displays vector components
        in a formatted badge when logged to [[PerkyLogger@editor]].
    `)


    section('Basic Usage', () => {

        text(`
            Import the renderer to register it. Vec2 objects logged via
            \`logger.log()\` will display with formatted x/y values.
        `)

        code('Setup', () => {
            // import './vec2_log_renderer.js'

            const position = new Vec2(10, 20)
            logger.log('Position:', position)
        })

        action('Log Vec2', () => {
            const position = new Vec2(100, 250)
            logger.log('Position:', position)
        })

    })


    section('Decimal Formatting', () => {

        text('Float values are rounded to 2 decimal places for readability.')

        action('Log floats', () => {
            const velocity = new Vec2(3.14159, -2.71828)
            logger.log('Velocity:', velocity)
        })

    })


    section('Multiple Vectors', () => {

        text('Multiple Vec2 objects can be logged in a single call.')

        action('Log multiple', () => {
            const start = new Vec2(0, 0)
            const end = new Vec2(100, 50)
            logger.log('From', start, 'to', end)
        })

    })

})
