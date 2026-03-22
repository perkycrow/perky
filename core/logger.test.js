import logger from './logger.js'
import Notifier from './notifier.js'
import {vi} from 'vitest'


describe('Logger', () => {

    beforeEach(() => {
        logger.consoleOutput = false
        logger.removeListeners()
        logger.clearHistory()
        logger.maxHistory = 100
    })


    test('is an instance of Notifier', () => {
        expect(logger).toBeInstanceOf(Notifier)
    })


    test('is a singleton', async () => {
        const logger2 = (await import('./logger.js')).default
        expect(logger2).toBe(logger)
    })


    describe('log', () => {
        test('emits log event with notice type', () => {
            const listener = vi.fn()
            logger.on('log', listener)

            logger.log('hello', 'world')

            expect(listener).toHaveBeenCalledTimes(1)
            const payload = listener.mock.calls[0][0]
            expect(payload.type).toBe('notice')
            expect(payload.items).toEqual(['hello', 'world'])
            expect(payload.timestamp).toBeTypeOf('number')
        })


        test('handles objects in items', () => {
            const listener = vi.fn()
            logger.on('log', listener)

            const obj = {foo: 'bar'}
            logger.log('data:', obj)

            const payload = listener.mock.calls[0][0]
            expect(payload.items).toEqual(['data:', obj])
        })
    })


    describe('convenience methods', () => {
        test('info calls log with type info', () => {
            const listener = vi.fn()
            logger.on('log', listener)

            logger.info('message')

            const payload = listener.mock.calls[0][0]
            expect(payload.type).toBe('info')
            expect(payload.items).toEqual(['message'])
        })


        test('notice calls log with type notice', () => {
            const listener = vi.fn()
            logger.on('log', listener)

            logger.notice('message')

            const payload = listener.mock.calls[0][0]
            expect(payload.type).toBe('notice')
        })


        test('warn calls log with type warn', () => {
            const listener = vi.fn()
            logger.on('log', listener)

            logger.warn('message')

            const payload = listener.mock.calls[0][0]
            expect(payload.type).toBe('warn')
        })


        test('error calls log with type error', () => {
            const listener = vi.fn()
            logger.on('log', listener)

            logger.error('message')

            const payload = listener.mock.calls[0][0]
            expect(payload.type).toBe('error')
        })


        test('success calls log with type success', () => {
            const listener = vi.fn()
            logger.on('log', listener)

            logger.success('message')

            const payload = listener.mock.calls[0][0]
            expect(payload.type).toBe('success')
        })


        test('convenience methods accept multiple arguments', () => {
            const listener = vi.fn()
            logger.on('log', listener)

            logger.info('a', 'b', 'c')

            const payload = listener.mock.calls[0][0]
            expect(payload.items).toEqual(['a', 'b', 'c'])
        })
    })


    test('clear emits clear event', () => {
        const listener = vi.fn()
        logger.on('clear', listener)

        logger.clear()

        expect(listener).toHaveBeenCalledTimes(1)
    })


    test('spacer emits spacer event', () => {
        const listener = vi.fn()
        logger.on('spacer', listener)

        logger.spacer()

        expect(listener).toHaveBeenCalledTimes(1)
    })


    test('title emits title event with title payload', () => {
        const listener = vi.fn()
        logger.on('title', listener)

        logger.title('My Title')

        const payload = listener.mock.calls[0][0]
        expect(payload.title).toBe('My Title')
        expect(payload.event).toBe('title')
    })


    describe('history', () => {
        test('stores log entries in history', () => {
            logger.info('message 1')
            logger.warn('message 2')

            expect(logger.history).toHaveLength(2)
            expect(logger.history[0].event).toBe('log')
            expect(logger.history[0].type).toBe('info')
            expect(logger.history[1].type).toBe('warn')
        })


        test('stores all event types in history', () => {
            logger.info('log')
            logger.clear()
            logger.spacer()
            logger.title('Title')

            expect(logger.history).toHaveLength(4)
            expect(logger.history[0].event).toBe('log')
            expect(logger.history[1].event).toBe('clear')
            expect(logger.history[2].event).toBe('spacer')
            expect(logger.history[3].event).toBe('title')
        })


        test('respects maxHistory limit', () => {
            logger.maxHistory = 3

            logger.info('1')
            logger.info('2')
            logger.info('3')
            logger.info('4')

            expect(logger.history).toHaveLength(3)
            expect(logger.history[0].items).toEqual(['2'])
            expect(logger.history[2].items).toEqual(['4'])
        })


        test('clearHistory empties history', () => {
            logger.info('message')
            expect(logger.history).toHaveLength(1)

            logger.clearHistory()
            expect(logger.history).toHaveLength(0)
        })


        test('default maxHistory is 100', () => {
            expect(logger.maxHistory).toBe(100)
        })


        test('setting maxHistory trims existing history', () => {
            logger.info('1')
            logger.info('2')
            logger.info('3')
            logger.info('4')
            logger.info('5')

            expect(logger.history).toHaveLength(5)

            logger.maxHistory = 2

            expect(logger.history).toHaveLength(2)
            expect(logger.history[0].items).toEqual(['4'])
            expect(logger.history[1].items).toEqual(['5'])
        })
    })


    describe('consoleOutput', () => {

        test('default consoleOutput is true', () => {
            logger.consoleOutput = true
            expect(logger.consoleOutput).toBe(true)
        })


        test('consoleOutput can be toggled', () => {
            logger.consoleOutput = true
            expect(logger.consoleOutput).toBe(true)

            logger.consoleOutput = false
            expect(logger.consoleOutput).toBe(false)
        })


        test('calls console.info when consoleOutput is true and type is info', () => {
            const spy = vi.spyOn(console, 'info').mockImplementation(() => {})
            logger.consoleOutput = true

            logger.info('test message')

            expect(spy).toHaveBeenCalledWith('test message')
            spy.mockRestore()
        })


        test('calls console.warn when consoleOutput is true and type is warn', () => {
            const spy = vi.spyOn(console, 'warn').mockImplementation(() => {})
            logger.consoleOutput = true

            logger.warn('warning message')

            expect(spy).toHaveBeenCalledWith('warning message')
            spy.mockRestore()
        })


        test('calls console.error when consoleOutput is true and type is error', () => {
            const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
            logger.consoleOutput = true

            logger.error('error message')

            expect(spy).toHaveBeenCalledWith('error message')
            spy.mockRestore()
        })


        test('calls console.log for notice type', () => {
            const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
            logger.consoleOutput = true

            logger.notice('notice message')

            expect(spy).toHaveBeenCalledWith('notice message')
            spy.mockRestore()
        })


        test('calls console.log for success type', () => {
            const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
            logger.consoleOutput = true

            logger.success('success message')

            expect(spy).toHaveBeenCalledWith('success message')
            spy.mockRestore()
        })


        test('does not call console when consoleOutput is false', () => {
            const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
            const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {})
            logger.consoleOutput = false

            logger.info('test')
            logger.notice('test')

            expect(logSpy).not.toHaveBeenCalled()
            expect(infoSpy).not.toHaveBeenCalled()
            logSpy.mockRestore()
            infoSpy.mockRestore()
        })

    })

})
