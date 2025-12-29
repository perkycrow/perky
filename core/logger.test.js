import logger from './logger'
import Notifier from './notifier'
import {vi} from 'vitest'


describe('Logger', () => {

    beforeEach(() => {
        logger.removeListeners()
        logger.clearHistory()
        logger.maxHistory = 100
    })


    test('is an instance of Notifier', () => {
        expect(logger).toBeInstanceOf(Notifier)
    })


    test('is a singleton', async () => {
        const logger2 = (await import('./logger')).default
        expect(logger2).toBe(logger)
    })


    describe('log', () => {
        test('emits log event with type and items', () => {
            const listener = vi.fn()
            logger.on('log', listener)

            logger.log('info', 'hello', 'world')

            expect(listener).toHaveBeenCalledTimes(1)
            const payload = listener.mock.calls[0][0]
            expect(payload.type).toBe('info')
            expect(payload.items).toEqual(['hello', 'world'])
            expect(payload.timestamp).toBeTypeOf('number')
        })


        test('handles objects in items', () => {
            const listener = vi.fn()
            logger.on('log', listener)

            const obj = {foo: 'bar'}
            logger.log('info', 'data:', obj)

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


    describe('clear', () => {
        test('emits clear event', () => {
            const listener = vi.fn()
            logger.on('clear', listener)

            logger.clear()

            expect(listener).toHaveBeenCalledTimes(1)
        })
    })


    describe('spacer', () => {
        test('emits spacer event', () => {
            const listener = vi.fn()
            logger.on('spacer', listener)

            logger.spacer()

            expect(listener).toHaveBeenCalledTimes(1)
        })
    })


    describe('title', () => {
        test('emits title event with title payload', () => {
            const listener = vi.fn()
            logger.on('title', listener)

            logger.title('My Title')

            const payload = listener.mock.calls[0][0]
            expect(payload.title).toBe('My Title')
            expect(payload.event).toBe('title')
        })
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
    })

})
