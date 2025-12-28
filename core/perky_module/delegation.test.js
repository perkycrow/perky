import {describe, test, expect, vi, beforeEach} from 'vitest'
import PerkyModule from '../perky_module'
import {
    delegateProperties,
    delegateTo,
    cleanDelegations,
    delegateEventsTo,
    cleanEventDelegations
} from './delegation.js'


describe('delegation', () => {

    describe('delegateProperties', () => {
        let receiver
        let source


        beforeEach(() => {
            receiver = {}
            source = {}
        })


        test('delegates methods with array notation', () => {
            source.method1 = vi.fn(() => 'result1') // eslint-disable-line max-nested-callbacks
            source.method2 = vi.fn(() => 'result2') // eslint-disable-line max-nested-callbacks

            delegateProperties(receiver, source, ['method1', 'method2'])

            expect(receiver.method1()).toBe('result1')
            expect(receiver.method2()).toBe('result2')
            expect(source.method1).toHaveBeenCalled()
            expect(source.method2).toHaveBeenCalled()
        })


        test('delegates properties with array notation', () => {
            source.prop1 = 'value1'
            source.prop2 = 'value2'

            delegateProperties(receiver, source, ['prop1', 'prop2'])

            expect(receiver.prop1).toBe('value1')
            expect(receiver.prop2).toBe('value2')
        })


        test('property changes reflect on source', () => {
            source.prop = 'initial'

            delegateProperties(receiver, source, ['prop'])

            receiver.prop = 'changed'
            expect(source.prop).toBe('changed')
        })


        test('delegates with object notation (aliasing)', () => {
            source.originalMethod = vi.fn(() => 'result') // eslint-disable-line max-nested-callbacks
            source.originalProp = 'value'

            delegateProperties(receiver, source, {
                originalMethod: 'aliasedMethod',
                originalProp: 'aliasedProp'
            })

            expect(receiver.aliasedMethod()).toBe('result')
            expect(receiver.aliasedProp).toBe('value')
        })


        test('delegates getters and setters', () => {
            let internalValue = 10
            Object.defineProperty(source, 'value', {
                get () {
                    return internalValue
                },
                set (newValue) {
                    internalValue = newValue
                },
                enumerable: true,
                configurable: true
            })

            delegateProperties(receiver, source, ['value'])

            expect(receiver.value).toBe(10)
            receiver.value = 20
            expect(internalValue).toBe(20)
            expect(receiver.value).toBe(20)
        })


        test('methods are bound to source context', () => {
            source.name = 'source'
            source.getName = function () {
                return this.name
            }

            delegateProperties(receiver, source, ['getName'])

            receiver.name = 'receiver'
            expect(receiver.getName()).toBe('source')
        })
    })


    describe('delegateTo', () => {
        let host
        let child


        beforeEach(() => {
            host = new PerkyModule({$id: 'host'})
            child = new PerkyModule({$id: 'child'})
        })


        test('delegates methods to host', () => {
            child.method = vi.fn(() => 'result')

            delegateTo.call(child, host, ['method'])

            expect(host.method).toBeDefined()
            expect(host.method()).toBe('result')
        })


        test('delegates properties to host', () => {
            child.prop = 'value'

            delegateTo.call(child, host, ['prop'])

            expect(host.prop).toBe('value')
        })


        test('tracks delegations for cleanup', () => {
            child.method = vi.fn()

            delegateTo.call(child, host, ['method'])

            expect(child.delegations).toHaveLength(1)
            expect(child.delegations[0].host).toBe(host)
            expect(child.delegations[0].propertyNames).toEqual(['method'])
        })


        test('tracks aliased delegations for cleanup', () => {
            child.original = vi.fn()

            delegateTo.call(child, host, {original: 'aliased'})

            expect(child.delegations[0].propertyNames).toEqual(['aliased'])
        })
    })


    describe('cleanDelegations', () => {
        let host
        let child


        beforeEach(() => {
            host = new PerkyModule({$id: 'host'})
            child = new PerkyModule({$id: 'child'})
        })


        test('removes all delegated properties from host', () => {
            child.method1 = vi.fn()
            child.method2 = vi.fn()
            child.prop = 'value'

            delegateTo.call(child, host, ['method1', 'prop'])
            delegateTo.call(child, host, ['method2'])

            expect(host.method1).toBeDefined()
            expect(host.method2).toBeDefined()
            expect(host.prop).toBeDefined()

            cleanDelegations.call(child)

            expect(host.method1).toBeUndefined()
            expect(host.method2).toBeUndefined()
            expect(host.prop).toBeUndefined()
        })


        test('clears delegations array', () => {
            child.method = vi.fn()

            delegateTo.call(child, host, ['method'])

            expect(child.delegations).toHaveLength(1)

            cleanDelegations.call(child)

            expect(child.delegations).toHaveLength(0)
        })


        test('handles multiple hosts', () => {
            const host2 = new PerkyModule({$id: 'host2'})
            child.method = vi.fn()

            delegateTo.call(child, host, ['method'])
            delegateTo.call(child, host2, ['method'])

            expect(host.method).toBeDefined()
            expect(host2.method).toBeDefined()

            cleanDelegations.call(child)

            expect(host.method).toBeUndefined()
            expect(host2.method).toBeUndefined()
        })
    })


    describe('delegateEventsTo', () => {
        let host
        let child


        beforeEach(() => {
            host = new PerkyModule({$id: 'host'})
            child = new PerkyModule({$id: 'child'})
        })


        test('forwards events to host', () => {
            const spy = vi.fn()
            host.on('update', spy)

            delegateEventsTo.call(child, host, ['update'])

            child.emit('update', 0.16)

            expect(spy).toHaveBeenCalledWith(0.16)
        })


        test('forwards multiple events', () => {
            const updateSpy = vi.fn()
            const renderSpy = vi.fn()
            host.on('update', updateSpy)
            host.on('render', renderSpy)

            delegateEventsTo.call(child, host, ['update', 'render'])

            child.emit('update', 0.16)
            child.emit('render', 1.0)

            expect(updateSpy).toHaveBeenCalledWith(0.16)
            expect(renderSpy).toHaveBeenCalledWith(1.0)
        })


        test('prefixes events with namespace', () => {
            const spy = vi.fn()
            host.on('child:update', spy)

            delegateEventsTo.call(child, host, ['update'], 'child')

            child.emit('update', 0.16)

            expect(spy).toHaveBeenCalledWith(0.16)
        })


        test('tracks event delegations for cleanup', () => {
            delegateEventsTo.call(child, host, ['update', 'render'])

            expect(child.eventDelegations).toHaveLength(1)
            expect(child.eventDelegations[0].callbacks).toHaveLength(2)
        })
    })


    describe('cleanEventDelegations', () => {
        let host
        let child


        beforeEach(() => {
            host = new PerkyModule({$id: 'host'})
            child = new PerkyModule({$id: 'child'})
        })


        test('stops forwarding events', () => {
            const spy = vi.fn()
            host.on('update', spy)

            delegateEventsTo.call(child, host, ['update'])

            child.emit('update', 0.16)
            expect(spy).toHaveBeenCalledTimes(1)

            cleanEventDelegations.call(child)

            child.emit('update', 0.16)
            expect(spy).toHaveBeenCalledTimes(1)
        })


        test('clears eventDelegations array', () => {
            delegateEventsTo.call(child, host, ['update'])

            expect(child.eventDelegations).toHaveLength(1)

            cleanEventDelegations.call(child)

            expect(child.eventDelegations).toHaveLength(0)
        })


        test('handles multiple delegation calls', () => {
            const updateSpy = vi.fn()
            const renderSpy = vi.fn()
            host.on('update', updateSpy)
            host.on('render', renderSpy)

            delegateEventsTo.call(child, host, ['update'])
            delegateEventsTo.call(child, host, ['render'])

            child.emit('update', 0.16)
            child.emit('render', 1.0)

            expect(updateSpy).toHaveBeenCalledTimes(1)
            expect(renderSpy).toHaveBeenCalledTimes(1)

            cleanEventDelegations.call(child)

            child.emit('update', 0.16)
            child.emit('render', 1.0)

            expect(updateSpy).toHaveBeenCalledTimes(1)
            expect(renderSpy).toHaveBeenCalledTimes(1)
        })
    })


    describe('integration with PerkyModule', () => {
        test('delegations are cleaned up on uninstall', () => {
            const host = new PerkyModule({$id: 'host'})
            const child = host.create(PerkyModule, {$id: 'child'})

            child.getValue = vi.fn(() => 42)
            child.delegateTo(host, ['getValue'])

            expect(host.getValue).toBeDefined()
            expect(host.getValue()).toBe(42)

            child.uninstall()

            expect(host.getValue).toBeUndefined()
        })


        test('event delegations are cleaned up on uninstall', () => {
            const host = new PerkyModule({$id: 'host'})
            const child = host.create(PerkyModule, {$id: 'child'})

            const spy = vi.fn()
            host.on('update', spy)

            child.delegateEventsTo(host, ['update'])

            child.emit('update', 0.16)
            expect(spy).toHaveBeenCalledTimes(1)

            child.uninstall()

            child.emit('update', 0.16)
            expect(spy).toHaveBeenCalledTimes(1)
        })


        test('delegations are cleaned up on dispose', () => {
            const host = new PerkyModule({$id: 'host'})
            const child = host.create(PerkyModule, {$id: 'child'})

            child.doSomething = vi.fn()
            child.delegateTo(host, ['doSomething'])

            expect(host.doSomething).toBeDefined()

            child.dispose()

            expect(host.doSomething).toBeUndefined()
        })
    })
})
