import {doc, section, setup, text, code, action, logger} from '../doc/runtime.js'
import Logger from './logger.js'


export default doc('Logger', {context: 'simple'}, () => {

    text(`
        Centralized logging system with history and event emission.
        Singleton instance with multiple log levels and console output control.
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
            logger.success('✓ All tests passed')
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
            const customLogger = new Logger()
            customLogger.consoleOutput = false

            customLogger.log('First entry')
            customLogger.warn('Second entry')
            customLogger.error('Third entry')

            logger.log('History length:', customLogger.history.length)
            logger.log('Last entry:', customLogger.history[customLogger.history.length - 1])
        })

        action('maxHistory', () => {
            const customLogger = new Logger()
            customLogger.consoleOutput = false
            customLogger.maxHistory = 3

            customLogger.log('Entry 1')
            customLogger.log('Entry 2')
            customLogger.log('Entry 3')
            customLogger.log('Entry 4')
            customLogger.log('Entry 5')

            logger.log('History length:', customLogger.history.length)
            logger.log('Oldest entry:', customLogger.history[0].items[0])
        })

        action('clearHistory', () => {
            const customLogger = new Logger()
            customLogger.consoleOutput = false

            customLogger.log('Entry 1')
            customLogger.log('Entry 2')
            logger.log('Before clear:', customLogger.history.length)

            customLogger.clearHistory()
            logger.log('After clear:', customLogger.history.length)
        })

    })


    section('Console Output', () => {

        text('Control whether logs are printed to console.')

        action('Disable console output', () => {
            const customLogger = new Logger()

            logger.log('Console output enabled:')
            customLogger.consoleOutput = true
            customLogger.log('This appears in console')

            logger.log('Console output disabled:')
            customLogger.consoleOutput = false
            customLogger.log('This is silent (but still recorded)')

            logger.log('History size:', customLogger.history.length)
        })

    })


    section('Events', () => {

        text('Logger emits events for all logging operations.')

        action('log event', () => {
            const customLogger = new Logger()
            customLogger.consoleOutput = false

            customLogger.on('log', entry => {
                logger.log('Log event:', entry.type, '-', entry.items)
            })

            customLogger.info('Info message')
            customLogger.warn('Warning message')
            customLogger.error('Error message')
        })

        action('clear event', () => {
            const customLogger = new Logger()
            customLogger.consoleOutput = false

            customLogger.on('clear', entry => {
                logger.log('Clear event at:', new Date(entry.timestamp))
            })

            customLogger.clear()
        })

        action('title event', () => {
            const customLogger = new Logger()
            customLogger.consoleOutput = false

            customLogger.on('title', entry => {
                logger.log('Title event:', entry.title)
            })

            customLogger.title('Section 1')
        })

        action('spacer event', () => {
            const customLogger = new Logger()
            customLogger.consoleOutput = false

            customLogger.on('spacer', entry => {
                logger.log('Spacer event at:', entry.timestamp)
            })

            customLogger.spacer()
        })

    })


    section('Entry Structure', () => {

        text('Log entries have a consistent structure with metadata.')

        action('Log entry format', () => {
            const customLogger = new Logger()
            customLogger.consoleOutput = false

            customLogger.info('Test message', {data: 'value'})

            const entry = customLogger.history[customLogger.history.length - 1]
            logger.log('event:', entry.event)
            logger.log('type:', entry.type)
            logger.log('items:', entry.items)
            logger.log('timestamp:', new Date(entry.timestamp))
        })

        action('Different event types', () => {
            const customLogger = new Logger()
            customLogger.consoleOutput = false

            customLogger.log('Log')
            customLogger.clear()
            customLogger.title('Title')
            customLogger.spacer()

            customLogger.history.forEach((entry, i) => {
                logger.log(`Entry ${i}:`, entry.event)
            })
        })

    })


    section('Practical Examples', () => {

        text('Real-world logging patterns.')

        action('Debug game state', () => {
            const gameLogger = new Logger()
            gameLogger.consoleOutput = false

            gameLogger.title('Game State Debug')
            gameLogger.info('Player position:', {x: 100, y: 200})
            gameLogger.info('Health:', 75)
            gameLogger.spacer()
            gameLogger.warn('Low health warning')
            gameLogger.success('Level completed!')

            logger.log('Total entries:', gameLogger.history.length)
        })

        action('Error tracking', () => {
            const errorLogger = new Logger()
            errorLogger.consoleOutput = false

            const errors = []
            errorLogger.on('log', entry => {
                if (entry.type === 'error') {
                    errors.push(entry)
                }
            })

            errorLogger.info('Starting process')
            errorLogger.error('Failed to load asset')
            errorLogger.warn('Retrying...')
            errorLogger.error('Connection timeout')
            errorLogger.success('Recovered')

            logger.log('Total errors:', errors.length)
            errors.forEach(err => {
                logger.log('Error:', err.items)
            })
        })

        action('Custom UI logger', () => {
            const uiLogger = new Logger()
            uiLogger.consoleOutput = false

            const messages = []
            uiLogger.on('log', entry => {
                messages.push(`[${entry.type.toUpperCase()}] ${entry.items.join(' ')}`)
            })

            uiLogger.info('Loading...')
            uiLogger.success('Ready!')
            uiLogger.warn('Check settings')

            logger.log('UI messages:')
            messages.forEach(msg => logger.log(msg))
        })

    })


    section('Advanced Patterns', () => {

        text('Complex logging scenarios.')

        action('Filtered logging', () => {
            const appLogger = new Logger()
            appLogger.consoleOutput = false

            // Only listen to warnings and errors
            appLogger.on('log', entry => {
                if (entry.type === 'warn' || entry.type === 'error') {
                    logger.log(`[${entry.type}]`, ...entry.items)
                }
            })

            appLogger.info('Starting')
            appLogger.warn('Deprecated API used')
            appLogger.error('Network error')
            appLogger.success('Complete')
        })

        action('Time-based filtering', () => {
            const timedLogger = new Logger()
            timedLogger.consoleOutput = false

            timedLogger.log('Entry 1')
            timedLogger.log('Entry 2')
            timedLogger.log('Entry 3')

            const now = Date.now()
            const recent = timedLogger.history.filter(entry => {
                return now - entry.timestamp < 1000
            })

            logger.log('Recent entries:', recent.length)
        })

        code('Multi-logger system', () => {
            const gameLogger = new Logger()
            const networkLogger = new Logger()
            const renderLogger = new Logger()

            gameLogger.maxHistory = 50
            networkLogger.maxHistory = 100
            renderLogger.maxHistory = 20

            // Each logger can be configured independently
            gameLogger.consoleOutput = true
            networkLogger.consoleOutput = false
            renderLogger.consoleOutput = false

            // Central aggregation
            const allLogs = [
                ...gameLogger.history,
                ...networkLogger.history,
                ...renderLogger.history
            ].sort((a, b) => a.timestamp - b.timestamp)
        })

    })


    section('Singleton Usage', () => {

        text('The default export is a singleton instance.')

        code('Default logger', () => {
            // import logger from './logger.js'

            // This is used throughout the codebase
            logger.log('Message')
            logger.info('Info')
            logger.error('Error')

            // Access history
            const history = logger.history
        })

        code('Custom logger instances', () => {
            // import Logger from './logger.js'

            // Create isolated loggers
            const moduleLogger = new Logger()
            moduleLogger.consoleOutput = false
            moduleLogger.maxHistory = 200

            // Won't affect global logger
            moduleLogger.log('Module message')
        })

    })


    section('Log Levels', () => {

        text('Different log levels map to console methods.')

        action('Console method mapping', () => {
            const customLogger = new Logger()

            // These map to specific console methods:
            customLogger.info('Uses console.info')
            customLogger.warn('Uses console.warn')
            customLogger.error('Uses console.error')
            customLogger.notice('Uses console.log')
            customLogger.success('Uses console.log')
        })

    })

})
