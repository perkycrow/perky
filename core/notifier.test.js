import Notifier from './notifier.js'
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
        test('registers listener on target', () => {
            const target = new Notifier()
            const listener = vi.fn()

            notifier.listenTo(target, 'test', listener)
            target.emit('test', 1, 2, 3)

            expect(listener).toHaveBeenCalledWith(1, 2, 3)
        })

        test('tracks multiple listeners on same target', () => {
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

        test('tracks listeners on multiple targets', () => {
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
        test('registers one-time listener on target', () => {
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

        test('removes from tracking after execution', () => {
            const target = new Notifier()
            const listener = vi.fn()

            notifier.listenToOnce(target, 'test', listener)
            target.emit('test', 'data')

            // Cleanup should not fail even if listener already executed
            expect(() => notifier.cleanExternalListeners()).not.toThrow()
        })

        test('works with multiple one-time listeners', () => {
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
        test('removes all tracked listeners', () => {
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

        test('removes listeners from multiple targets', () => {
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

        test('handles empty listener list', () => {
            expect(() => notifier.cleanExternalListeners()).not.toThrow()
        })

        test('allows reusing notifier after cleanup', () => {
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

        test('cleans up mix of listenTo and listenToOnce', () => {
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


    describe('emitter', () => {
        test('returns a function that emits the given event', () => {
            const listener = vi.fn()
            notifier.on('test', listener)

            const emitTest = notifier.emitter('test')
            emitTest(1, 2, 3)

            expect(listener).toHaveBeenCalledWith(1, 2, 3)
        })

        test('passes all arguments to emit', () => {
            const listener = vi.fn()
            notifier.on('foo', listener)

            const emitFoo = notifier.emitter('foo')
            emitFoo('a', 'b', 'c', 'd')

            expect(listener).toHaveBeenCalledWith('a', 'b', 'c', 'd')
        })

        test('works with no arguments', () => {
            const listener = vi.fn()
            notifier.on('bar', listener)

            const emitBar = notifier.emitter('bar')
            emitBar()

            expect(listener).toHaveBeenCalledWith()
        })

        test('creates different emitters for different events', () => {
            const listener1 = vi.fn()
            const listener2 = vi.fn()
            notifier.on('event1', listener1)
            notifier.on('event2', listener2)

            const emit1 = notifier.emitter('event1')
            const emit2 = notifier.emitter('event2')

            emit1('data1')
            emit2('data2')

            expect(listener1).toHaveBeenCalledWith('data1')
            expect(listener2).toHaveBeenCalledWith('data2')
        })
    })


    describe('delegateEvents', () => {
        test('delegates events without namespace', () => {
            const target = new Notifier()
            const listener = vi.fn()

            notifier.on('test', listener)
            notifier.delegateEvents(target, ['test'])

            target.emit('test', 1, 2, 3)
            expect(listener).toHaveBeenCalledWith(1, 2, 3)
        })

        test('delegates events with namespace prefix', () => {
            const target = new Notifier()
            const listener = vi.fn()

            notifier.on('child:test', listener)
            notifier.delegateEvents(target, ['test'], 'child')

            target.emit('test', 'data')
            expect(listener).toHaveBeenCalledWith('data')
        })

        test('handles multiple events from array', () => {
            const target = new Notifier()
            const listener1 = vi.fn()
            const listener2 = vi.fn()

            notifier.on('event1', listener1)
            notifier.on('event2', listener2)
            notifier.delegateEvents(target, ['event1', 'event2'])

            target.emit('event1', 'a')
            target.emit('event2', 'b')

            expect(listener1).toHaveBeenCalledWith('a')
            expect(listener2).toHaveBeenCalledWith('b')
        })

        test('handles events object', () => {
            const target = new Notifier()
            const listener1 = vi.fn()
            const listener2 = vi.fn()

            notifier.on('foo', listener1)
            notifier.on('bar', listener2)
            notifier.delegateEvents(target, {foo: true, bar: true})

            target.emit('foo', 1)
            target.emit('bar', 2)

            expect(listener1).toHaveBeenCalledWith(1)
            expect(listener2).toHaveBeenCalledWith(2)
        })

        test('combines namespace with events object', () => {
            const target = new Notifier()
            const listener1 = vi.fn()
            const listener2 = vi.fn()

            notifier.on('ns:foo', listener1)
            notifier.on('ns:bar', listener2)
            notifier.delegateEvents(target, {foo: true, bar: true}, 'ns')

            target.emit('foo', 'x')
            target.emit('bar', 'y')

            expect(listener1).toHaveBeenCalledWith('x')
            expect(listener2).toHaveBeenCalledWith('y')
        })

        test('returns early if target is null', () => {
            expect(() => notifier.delegateEvents(null, ['test'])).not.toThrow()
        })

        test('returns early if target is undefined', () => {
            expect(() => notifier.delegateEvents(undefined, ['test'])).not.toThrow()
        })

        test('returns early if events is not array or object', () => {
            const target = new Notifier()
            expect(() => notifier.delegateEvents(target, 'string')).not.toThrow()
            expect(() => notifier.delegateEvents(target, 123)).not.toThrow()
        })

        test('cleans up delegated listeners', () => {
            const target = new Notifier()
            const listener = vi.fn()

            notifier.on('test', listener)
            notifier.delegateEvents(target, ['test'])

            target.emit('test', 'before')
            expect(listener).toHaveBeenCalledWith('before')

            notifier.cleanExternalListeners()

            target.emit('test', 'after')
            expect(listener).toHaveBeenCalledTimes(1)
        })
    })

})
