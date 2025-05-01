import Notifier from '../src/notifier'
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
