import {doc, section, text, code, action, logger} from '../doc/runtime.js'


export default doc('Logger', () => {

    text(`
        Centralized logging system with history and event emission.
        Singleton instance with multiple log levels and logger output control.
    `)


    section('Basic Logging', () => {

        text('Log messages at different severity levels.')

        action('log / notice', () => {
            logger.log('This is a notice')
            logger.notice('Same as log()')
        })

        action('info', () => {
            logger.info('Informational message')
            logger.info('Multiple', 'arguments', 'supported')
        })

        action('warn', () => {
            logger.warn('Warning message')
            logger.warn('Something might be wrong')
        })

        action('error', () => {
            logger.error('Error occurred')
            logger.error('Critical issue:', new Error('test'))
        })

        action('success', () => {
            logger.success('Operation completed')
            logger.success('All tests passed')
        })

    })


    section('Formatting', () => {

        text('Special formatting methods for better readability.')

        action('title', () => {
            logger.title('Section Header')
            logger.log('Content below the title')
        })

        action('spacer', () => {
            logger.log('First group')
            logger.spacer()
            logger.log('Second group')
        })

        action('clear', () => {
            logger.log('This will be cleared')
            logger.clear()
            logger.log('Fresh start')
        })

    })


    section('History', () => {

        text('Logger maintains a history of all log entries.')

        action('Accessing history', () => {
            logger.log('First entry')
            logger.warn('Second entry')
            logger.error('Third entry')

            logger.log('History length:', logger.history.length)
            logger.log('Last entry:', logger.history[logger.history.length - 1])
        })

        action('clearHistory', () => {
            logger.log('Entry 1')
            logger.log('Entry 2')
            logger.log('Before clear:', logger.history.length)

            logger.clearHistory()
            logger.log('After clear:', logger.history.length)
        })

    })


    section('Events', () => {

        text('Logger emits events for all logging operations.')

        action('log event', () => {
            const handler = entry => {
                logger.log('Log event:', entry.type, '-', entry.items)
            }

            logger.on('log', handler)
            logger.info('Info message')
            logger.warn('Warning message')
            logger.off('log', handler)
        })

        action('clear event', () => {
            const handler = entry => {
                logger.log('Clear event at:', new Date(entry.timestamp))
            }

            logger.on('clear', handler)
            logger.clear()
            logger.off('clear', handler)
        })

        action('title event', () => {
            const handler = entry => {
                logger.log('Title event:', entry.title)
            }

            logger.on('title', handler)
            logger.title('Section 1')
            logger.off('title', handler)
        })

        action('spacer event', () => {
            const handler = entry => {
                logger.log('Spacer event at:', entry.timestamp)
            }

            logger.on('spacer', handler)
            logger.spacer()
            logger.off('spacer', handler)
        })

    })


    section('Entry Structure', () => {

        text('Log entries have a consistent structure with metadata.')

        action('Log entry format', () => {
            logger.info('Test message', {data: 'value'})

            const entry = logger.history[logger.history.length - 1]
            logger.log('event:', entry.event)
            logger.log('type:', entry.type)
            logger.log('items:', entry.items)
            logger.log('timestamp:', new Date(entry.timestamp))
        })

        action('Different event types', () => {
            logger.clearHistory()

            logger.log('Log')
            logger.clear()
            logger.title('Title')
            logger.spacer()

            logger.history.forEach((entry, i) => {
                logger.log(`Entry ${i}:`, entry.event)
            })
        })

    })


    section('Configuration', () => {

        text('Configure logger behavior.')

        code('maxHistory', () => {
            // Limit history size (default: 100)
            logger.maxHistory = 50

            // History automatically trims when limit is reached
        })

        code('loggerOutput', () => {
            // Disable logger output (logs still recorded in history)
            logger.loggerOutput = false

            logger.log('This is silent but recorded')

            // Re-enable
            logger.loggerOutput = true
        })

    })


    section('Log Levels', () => {

        text('Different log levels map to logger methods.')

        code('Logger method mapping', () => {
            logger.info('Uses logger.info')
            logger.warn('Uses logger.warn')
            logger.error('Uses logger.error')
            logger.notice('Uses logger.log')
            logger.success('Uses logger.log')
        })

    })

})
