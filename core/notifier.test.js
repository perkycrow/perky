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

        notifier.on('foo', () => { })
        expect(notifier.getListenersFor('foo')).toHaveLength(1)
    })


    test('on', () => {
        const listener = () => { }

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
        const listener = () => { }

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


    test('removeListeners', () => {
        notifier.on('foo', () => { })
        notifier.on('bar', () => { })

        expect(notifier.getListenersFor('foo')).toHaveLength(1)
        expect(notifier.getListenersFor('bar')).toHaveLength(1)

        notifier.removeListeners()
        expect(notifier.getListenersFor('foo')).toBeUndefined()
        expect(notifier.getListenersFor('bar')).toBeUndefined()
    })


    test('removeListenersFor', () => {
        notifier.on('foo', () => { })
        notifier.on('bar', () => { })

        expect(notifier.getListenersFor('foo')).toHaveLength(1)
        expect(notifier.getListenersFor('bar')).toHaveLength(1)

        notifier.removeListenersFor('foo')
        expect(notifier.getListenersFor('foo')).toBeUndefined()
        expect(notifier.getListenersFor('bar')).toHaveLength(1)
    })


    test('instances have separate listeners', () => {
        const notifier1 = new Notifier()
        const notifier2 = new Notifier()

        notifier1.on('test', () => { })
        expect(notifier1.getListenersFor('test')).toHaveLength(1)
        expect(notifier2.getListenersFor('test')).toBeUndefined()

        notifier2.on('test', () => { })
        notifier2.on('test', () => { })
        expect(notifier1.getListenersFor('test')).toHaveLength(1)
        expect(notifier2.getListenersFor('test')).toHaveLength(2)
    })


    test('emit passes notifier as this context to listeners', () => {
        let receivedContext

        function listener () {
            receivedContext = this
        }

        notifier.on('test', listener)
        notifier.emit('test', 'arg1', 'arg2')

        expect(receivedContext).toBe(notifier)
    })


    describe('listenTo', () => {
        test('should register listener on target and track it', () => {
            const target = new Notifier()
            const listener = vi.fn()

            notifier.listenTo(target, 'test', listener)
            target.emit('test', 1, 2, 3)

            expect(listener).toHaveBeenCalledWith(1, 2, 3)
        })

        test('should track multiple listeners on same target', () => {
            const target = new Notifier()
            const listener1 = vi.fn()
            const listener2 = vi.fn()

            notifier.listenTo(target, 'event1', listener1)
            notifier.listenTo(target, 'event2', listener2)

            target.emit('event1', 'a')
            target.emit('event2', 'b')

            expect(listener1).toHaveBeenCalledWith('a')
            expect(listener2).toHaveBeenCalledWith('b')
        })

        test('should track listeners on multiple targets', () => {
            const target1 = new Notifier()
            const target2 = new Notifier()
            const listener1 = vi.fn()
            const listener2 = vi.fn()

            notifier.listenTo(target1, 'test', listener1)
            notifier.listenTo(target2, 'test', listener2)

            target1.emit('test', 1)
            target2.emit('test', 2)

            expect(listener1).toHaveBeenCalledWith(1)
            expect(listener2).toHaveBeenCalledWith(2)
        })
    })


    describe('listenToOnce', () => {
        test('should register one-time listener on target', () => {
            const target = new Notifier()
            const listener = vi.fn()

            notifier.listenToOnce(target, 'test', listener)

            target.emit('test', 1, 2, 3)
            expect(listener).toHaveBeenCalledWith(1, 2, 3)
            expect(listener).toHaveBeenCalledTimes(1)

            // Should not be called again
            target.emit('test', 4, 5, 6)
            expect(listener).toHaveBeenCalledTimes(1)
        })

        test('should remove from tracking after execution', () => {
            const target = new Notifier()
            const listener = vi.fn()

            notifier.listenToOnce(target, 'test', listener)
            target.emit('test', 'data')

            // Cleanup should not fail even if listener already executed
            expect(() => notifier.cleanExternalListeners()).not.toThrow()
        })

        test('should work with multiple one-time listeners', () => {
            const target = new Notifier()
            const listener1 = vi.fn()
            const listener2 = vi.fn()

            notifier.listenToOnce(target, 'event1', listener1)
            notifier.listenToOnce(target, 'event2', listener2)

            target.emit('event1', 'a')
            target.emit('event2', 'b')

            expect(listener1).toHaveBeenCalledWith('a')
            expect(listener2).toHaveBeenCalledWith('b')
            expect(listener1).toHaveBeenCalledTimes(1)
            expect(listener2).toHaveBeenCalledTimes(1)
        })
    })


    describe('cleanExternalListeners', () => {
        test('should remove all tracked listeners', () => {
            const target = new Notifier()
            const listener1 = vi.fn()
            const listener2 = vi.fn()

            notifier.listenTo(target, 'event1', listener1)
            notifier.listenTo(target, 'event2', listener2)

            notifier.cleanExternalListeners()

            // Listeners should not be called after cleanup
            target.emit('event1', 'a')
            target.emit('event2', 'b')

            expect(listener1).not.toHaveBeenCalled()
            expect(listener2).not.toHaveBeenCalled()
        })

        test('should remove listeners from multiple targets', () => {
            const target1 = new Notifier()
            const target2 = new Notifier()
            const listener1 = vi.fn()
            const listener2 = vi.fn()

            notifier.listenTo(target1, 'test', listener1)
            notifier.listenTo(target2, 'test', listener2)

            notifier.cleanExternalListeners()

            target1.emit('test', 1)
            target2.emit('test', 2)

            expect(listener1).not.toHaveBeenCalled()
            expect(listener2).not.toHaveBeenCalled()
        })

        test('should handle empty listener list', () => {
            expect(() => notifier.cleanExternalListeners()).not.toThrow()
        })

        test('should allow reusing notifier after cleanup', () => {
            const target = new Notifier()
            const listener1 = vi.fn()
            const listener2 = vi.fn()

            notifier.listenTo(target, 'test', listener1)
            notifier.cleanExternalListeners()
            notifier.listenTo(target, 'test', listener2)

            target.emit('test', 'data')

            expect(listener1).not.toHaveBeenCalled()
            expect(listener2).toHaveBeenCalledWith('data')
        })

        test('should cleanup mix of listenTo and listenToOnce', () => {
            const target = new Notifier()
            const listener1 = vi.fn()
            const listener2 = vi.fn()

            notifier.listenTo(target, 'event1', listener1)
            notifier.listenToOnce(target, 'event2', listener2)

            notifier.cleanExternalListeners()

            target.emit('event1', 'a')
            target.emit('event2', 'b')

            expect(listener1).not.toHaveBeenCalled()
            expect(listener2).not.toHaveBeenCalled()
        })
    })

})
