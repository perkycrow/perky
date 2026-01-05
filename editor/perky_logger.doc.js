import {doc, section, setup, text, code, action, logger} from '../docs/runtime.js'
import Vec2 from '../math/vec2.js'


export default doc('PerkyLogger', {context: 'simple'}, () => {

    text(`
        Web component for displaying log messages.
        Automatically syncs with the global \`logger\` instance.
    `)


    code('Usage', () => {
        // In HTML
        // <perky-logger max-entries="50"></perky-logger>

        // Logs appear automatically via the global logger
        logger.log('Hello world')
    })


    section('Log types', () => {

        text('Different log types have different visual indicators.')

        action('info', () => {
            logger.info('This is an info message')
        })

        action('notice', () => {
            logger.notice('This is a notice message')
        })

        action('warn', () => {
            logger.warn('This is a warning message')
        })

        action('error', () => {
            logger.error('This is an error message')
        })

        action('success', () => {
            logger.success('This is a success message')
        })

    })


    section('Formatting', () => {

        text('The logger supports titles and spacers for organization.')

        action('title', () => {
            logger.title('Section Title')
            logger.log('Content under title')
        })

        action('spacer', () => {
            logger.log('Before spacer')
            logger.spacer()
            logger.log('After spacer')
        })

        action('clear', () => {
            logger.clear()
            logger.log('Logger cleared')
        })

    })


    section('Rich objects', () => {

        text('Objects, arrays, and Vec2 are rendered with special formatting.')

        action('Object', () => {
            logger.log('user:', {name: 'Alice', age: 30, active: true})
        })

        action('Array', () => {
            logger.log('items:', ['sword', 'shield', 'potion'])
        })

        action('Vec2', () => {
            const position = new Vec2(100, 200)
            logger.log('position:', position)
        })

        action('Nested', () => {
            logger.log('data:', {
                player: {name: 'Bob', pos: new Vec2(10, 20)},
                inventory: ['gold', 'key']
            })
        })

    })


    section('Multiple arguments', () => {

        text('All log methods accept multiple arguments.')

        action('Multiple values', () => {
            const x = 42
            const y = 'hello'
            logger.log('x:', x, 'y:', y)
        })

        action('Mixed types', () => {
            logger.info('Position:', new Vec2(5, 10), 'Score:', 100)
        })

    })

})
