import Notifier from './notifier'
import {vi} from 'vitest'


describe(Notifier, () => {

    let notifier

    beforeEach(() => {
        notifier = new Notifier()
    })


    test('constructor', () => {
        expect(notifier.listenersFor).toEqual({})
    })


    test('getListenersFor', () => {
        expect(notifier.getListenersFor('foo')).toBeUndefined()

        notifier.listenersFor.foo = []
        expect(notifier.getListenersFor('foo')).toEqual([])
    })


    test('on', () => {
        const listener = () => {}

        expect(notifier.on('foo', listener)).toBe(listener)
        expect(notifier.listenersFor.foo).toEqual([listener])
    })


    test('off', () => {
        const listener = () => {}

        expect(notifier.off('foo', listener)).toBe(false)

        notifier.listenersFor.foo = [listener]
        expect(notifier.off('foo', listener)).toBe(true)
        expect(notifier.listenersFor.foo).toEqual([])
    })


    test('emit', () => {
        const listener = vi.fn()

        notifier.listenersFor.foo = [listener]
        notifier.emit('foo', 1, 2, 3)
        expect(listener).toHaveBeenCalledWith(1, 2, 3)

        notifier.emit('bar')
        expect(listener).toHaveBeenCalledTimes(1)
    })


    test('emitAsync', async () => {
        const listener1 = vi.fn().mockResolvedValue(42)
        const listener2 = vi.fn().mockResolvedValue(24)

        notifier.listenersFor.foo = [listener1, listener2]
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

        notifier.listenersFor.foo = [listener1, listener1]
        expect(notifier.emitCallbacks('foo', 1, 2, 3)).toBe(true)
        expect(listener1).toHaveBeenCalledTimes(2)
        expect(listener1).toHaveBeenCalledWith(1, 2, 3)

        listener1.mockClear()
        notifier.listenersFor.bar = [listener1, listener2, listener3]
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

        notifier.listenersFor.foo = [listener1, listener1]
        expect(await notifier.emitCallbacksAsync('foo', 1, 2, 3)).toBe(true)
        expect(listener1).toHaveBeenCalledTimes(2)
        expect(listener1).toHaveBeenCalledWith(1, 2, 3)

        listener1.mockClear()
        notifier.listenersFor.bar = [listener1, listener2, listener3]
        expect(await notifier.emitCallbacksAsync('bar', 4, 5, 6)).toBe(false)
        expect(listener1).toHaveBeenCalledTimes(1)
        expect(listener2).toHaveBeenCalledTimes(1)
        expect(listener3).not.toHaveBeenCalled()

        expect(await notifier.emitCallbacksAsync('nonexistent')).toBe(true)
    })


    test('removeListeners', () => {
        notifier.listenersFor.foo = [() => {}]
        notifier.listenersFor.bar = [() => {}]

        notifier.removeListeners()
        expect(notifier.listenersFor).toEqual({})
    })


    test('removeListenersFor', () => {
        notifier.listenersFor.foo = [() => {}]
        notifier.listenersFor.bar = [() => {}]

        notifier.removeListenersFor('foo')
        expect(notifier.listenersFor).toEqual({bar: notifier.listenersFor.bar})
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

})
