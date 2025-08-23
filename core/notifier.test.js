import Notifier from './notifier'
import {vi} from 'vitest'


describe(Notifier, () => {

    let notifier

    beforeEach(() => {
        notifier = new Notifier()
    })


    test('constructor', () => {
        expect(notifier.getListenersFor('any')).toBeUndefined()
    })


    test('getListenersFor', () => {
        expect(notifier.getListenersFor('foo')).toBeUndefined()

        notifier.on('foo', () => {})
        expect(notifier.getListenersFor('foo')).toHaveLength(1)
    })


    test('on', () => {
        const listener = () => {}

        expect(notifier.on('foo', listener)).toBe(listener)
        expect(notifier.getListenersFor('foo')).toEqual([listener])
    })


    test('once', () => {
        const listener = vi.fn()
        const wrapper = notifier.once('foo', listener)

        expect(wrapper).not.toBe(listener)
        expect(notifier.getListenersFor('foo')).toEqual([wrapper])

        notifier.emit('foo', 1, 2, 3)
        expect(listener).toHaveBeenCalledWith(1, 2, 3)
        expect(notifier.getListenersFor('foo')).toEqual([])
    })


    test('off', () => {
        const listener = () => {}

        expect(notifier.off('foo', listener)).toBe(false)

        notifier.on('foo', listener)
        expect(notifier.off('foo', listener)).toBe(true)
        expect(notifier.getListenersFor('foo')).toEqual([])
    })


    test('emit', () => {
        const listener = vi.fn()

        notifier.on('foo', listener)
        notifier.emit('foo', 1, 2, 3)
        expect(listener).toHaveBeenCalledWith(1, 2, 3)

        notifier.emit('bar')
        expect(listener).toHaveBeenCalledTimes(1)
    })


    test('emitAsync', async () => {
        const listener1 = vi.fn().mockResolvedValue(42)
        const listener2 = vi.fn().mockResolvedValue(24)

        notifier.on('foo', listener1)
        notifier.on('foo', listener2)
        await notifier.emitAsync('foo', 1, 2, 3)
        
        expect(listener1).toHaveBeenCalledWith(1, 2, 3)
        expect(listener2).toHaveBeenCalledWith(1, 2, 3)

        await notifier.emitAsync('bar')
        expect(listener1).toHaveBeenCalledTimes(1)
        expect(listener2).toHaveBeenCalledTimes(1)
    })


    test('emitCallbacks', () => {
        const listener1 = vi.fn().mockReturnValue(true)
        const listener2 = vi.fn().mockReturnValue(false)
        const listener3 = vi.fn()

        notifier.on('foo', listener1)
        notifier.on('foo', listener1)
        expect(notifier.emitCallbacks('foo', 1, 2, 3)).toBe(true)
        expect(listener1).toHaveBeenCalledTimes(2)
        expect(listener1).toHaveBeenCalledWith(1, 2, 3)

        listener1.mockClear()
        notifier.on('bar', listener1)
        notifier.on('bar', listener2)
        notifier.on('bar', listener3)
        expect(notifier.emitCallbacks('bar', 4, 5, 6)).toBe(false)
        expect(listener1).toHaveBeenCalledTimes(1)
        expect(listener2).toHaveBeenCalledTimes(1)
        expect(listener3).not.toHaveBeenCalled()

        expect(notifier.emitCallbacks('nonexistent')).toBe(true)
    })


    test('emitCallbacksAsync', async () => {
        const listener1 = vi.fn().mockResolvedValue(true)
        const listener2 = vi.fn().mockResolvedValue(false)
        const listener3 = vi.fn()

        notifier.on('foo', listener1)
        notifier.on('foo', listener1)
        expect(await notifier.emitCallbacksAsync('foo', 1, 2, 3)).toBe(true)
        expect(listener1).toHaveBeenCalledTimes(2)
        expect(listener1).toHaveBeenCalledWith(1, 2, 3)

        listener1.mockClear()
        notifier.on('bar', listener1)
        notifier.on('bar', listener2)
        notifier.on('bar', listener3)
        expect(await notifier.emitCallbacksAsync('bar', 4, 5, 6)).toBe(false)
        expect(listener1).toHaveBeenCalledTimes(1)
        expect(listener2).toHaveBeenCalledTimes(1)
        expect(listener3).not.toHaveBeenCalled()

        expect(await notifier.emitCallbacksAsync('nonexistent')).toBe(true)
    })


    test('removeListeners', () => {
        notifier.on('foo', () => {})
        notifier.on('bar', () => {})

        expect(notifier.getListenersFor('foo')).toHaveLength(1)
        expect(notifier.getListenersFor('bar')).toHaveLength(1)

        notifier.removeListeners()
        expect(notifier.getListenersFor('foo')).toBeUndefined()
        expect(notifier.getListenersFor('bar')).toBeUndefined()
    })


    test('removeListenersFor', () => {
        notifier.on('foo', () => {})
        notifier.on('bar', () => {})

        expect(notifier.getListenersFor('foo')).toHaveLength(1)
        expect(notifier.getListenersFor('bar')).toHaveLength(1)

        notifier.removeListenersFor('foo')
        expect(notifier.getListenersFor('foo')).toBeUndefined()
        expect(notifier.getListenersFor('bar')).toHaveLength(1)
    })


    test('addCapabilitiesTo', () => {
        const target = {}

        Notifier.addCapabilitiesTo(target)
        expect(target).toEqual(expect.objectContaining({
            on: expect.any(Function),
            off: expect.any(Function),
            emit: expect.any(Function),
            emitter: expect.any(Function),
            removeListeners: expect.any(Function),
            removeListenersFor: expect.any(Function)
        }))

        const listener = vi.fn()
        target.on('foo', listener)
        target.emit('foo', 1, 2, 3)
        expect(listener).toHaveBeenCalledWith(1, 2, 3)
    })


    test('instances have separate listeners', () => {
        const notifier1 = new Notifier()
        const notifier2 = new Notifier()

        notifier1.on('test', () => {})
        expect(notifier1.getListenersFor('test')).toHaveLength(1)
        expect(notifier2.getListenersFor('test')).toBeUndefined()

        notifier2.on('test', () => {})
        notifier2.on('test', () => {})
        expect(notifier1.getListenersFor('test')).toHaveLength(1)
        expect(notifier2.getListenersFor('test')).toHaveLength(2)
    })

})
