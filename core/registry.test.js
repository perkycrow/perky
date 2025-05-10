import Registry from './registry'
import {vi} from 'vitest'


describe(Registry, () => {

    let registry

    beforeEach(() => {
        registry = new Registry()
    })


    test('set', () => {
        const spy = vi.spyOn(registry, 'emit')

        registry.set('key', 'value')

        expect(registry.get('key')).toBe('value')
        expect(spy).toHaveBeenCalledWith('set', 'key', 'value', undefined)

        registry.set('key', 'newValue')
        expect(registry.get('key')).toBe('newValue')
        expect(spy).toHaveBeenCalledWith('set', 'key', 'newValue', 'value')
    })


    test('delete', () => {
        const spy = vi.spyOn(registry, 'emit')

        registry.set('key', 'value')
        spy.mockClear()

        const result = registry.delete('key')

        expect(result).toBe(true)
        expect(registry.has('key')).toBe(false)
        expect(spy).toHaveBeenCalledWith('delete', 'key', 'value')
        expect(spy).toHaveBeenCalledTimes(1)
    })


    test('delete non-existent', () => {
        const spy = vi.spyOn(registry, 'emit')
        const result = registry.delete('nonexistent')
        expect(result).toBe(false)
        expect(spy).not.toHaveBeenCalled()
    })


    test('clear', () => {
        registry.set('key1', 'value1')
        registry.set('key2', 'value2')
        registry.clear()

        expect(registry.size).toBe(0)
    })


    test('clear empty', () => {
        const spy = vi.spyOn(registry, 'emit')
        registry.clear()
        expect(registry.size).toBe(0)
        expect(spy).not.toHaveBeenCalled()
    })


    test('invoke and reverseInvoke', () => {
        const calls = []
        
        const obj1 = {method: (arg) => calls.push(['obj1', arg])}
        const obj2 = {method: (arg) => calls.push(['obj2', arg]), otherMethod: () => {}}
        const obj3 = {notMethod: 'not a method'}
        
        registry.set('obj1', obj1)
        registry.set('obj2', obj2)
        registry.set('obj3', obj3)
        
        registry.invoke('method', 'arg1')
        expect(calls).toEqual([['obj1', 'arg1'], ['obj2', 'arg1']])
        
        calls.length = 0
        
        registry.reverseInvoke('method', 'arg2')
        expect(calls).toEqual([['obj2', 'arg2'], ['obj1', 'arg2']])

        calls.length = 0
        registry.invoke('nonExistentMethod', 'arg3')
        expect(calls).toEqual([])
    })


    test('invoke with error', () => {
        const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {
            // Intentionally empty to suppress console output
        })
        const calls = []
        const obj1 = {method: () => {
            throw new Error('Test Error')
        }}
        const obj2 = {method: () => calls.push('obj2')}

        registry.set('obj1', obj1)
        registry.set('obj2', obj2)

        registry.invoke('method')
        expect(calls).toEqual(['obj2'])
        expect(errorSpy).toHaveBeenCalled()
        errorSpy.mockRestore()
    })


    test('invoker and reverseInvoker', () => {
        const calls = []
        
        const obj1 = {method: (arg) => calls.push(['obj1', arg])}
        const obj2 = {method: (arg) => calls.push(['obj2', arg])}
        
        registry.set('obj1', obj1)
        registry.set('obj2', obj2)
        
        const invoker = registry.invoker('method')
        invoker('arg1')
        expect(calls).toEqual([['obj1', 'arg1'], ['obj2', 'arg1']])

        calls.length = 0
        
        const reverseInvoker = registry.reverseInvoker('method')
        reverseInvoker('arg2')
        expect(calls).toEqual([['obj2', 'arg2'], ['obj1', 'arg2']])
    })


    test('addCollection object', () => {
        const spy = vi.spyOn(registry, 'emit')
        const collection = {
            foo: 'bar',
            baz: 'qux'
        }
        
        registry.addCollection(collection)
        expect(registry.get('foo')).toBe('bar')
        expect(registry.get('baz')).toBe('qux')
        expect(registry.size).toBe(2)
        expect(spy).toHaveBeenCalledTimes(2)
        expect(spy).toHaveBeenCalledWith('set', 'foo', 'bar', undefined)
        expect(spy).toHaveBeenCalledWith('set', 'baz', 'qux', undefined)
    })


    test('addCollection map', () => {
        const spy = vi.spyOn(registry, 'emit')
        const map = new Map([
            ['one', 1],
            ['two', 2]
        ])

        registry.addCollection(map)
        expect(registry.get('one')).toBe(1)
        expect(registry.get('two')).toBe(2)
        expect(registry.size).toBe(2)
        expect(spy).toHaveBeenCalledTimes(2)
        expect(spy).toHaveBeenCalledWith('set', 'one', 1, undefined)
        expect(spy).toHaveBeenCalledWith('set', 'two', 2, undefined)
    })


    test('addCollection invalid', () => {
        expect(() => registry.addCollection(null)).toThrow('Collection must be an object or Map')
        expect(() => registry.addCollection(123)).toThrow('Collection must be an object or Map')
    })


    test('toObject', () => {
        const foo = {name: 'foo'}
        const bar = {name: 'bar'}
        
        registry.set('foo', foo)
        registry.set('bar', bar)
        
        const object = registry.toObject()
        
        expect(object).toEqual({
            foo,
            bar
        })
        expect(registry.toObject()).not.toBe(registry.map)
    })


    test('keys', () => {
        registry.set('a', 1)
        registry.set('b', 2)

        expect(Array.from(registry.keys)).toEqual(['a', 'b'])
    })


    test('values', () => {
        registry.set('a', 1)
        registry.set('b', 2)

        expect(Array.from(registry.values)).toEqual([1, 2])
    })


    test('entries', () => {
        registry.set('a', 1)
        registry.set('b', 2)

        expect(Array.from(registry.entries)).toEqual([['a', 1], ['b', 2]])
    })


    test('hasValue', () => {
        registry.set('a', 1)
        registry.set('b', 2)

        expect(registry.hasValue(1)).toBe(true)
        expect(registry.hasValue(3)).toBe(false)
    })


    test('keyFor', () => {
        registry.set('a', 1)
        registry.set('b', 2)

        expect(registry.keyFor(1)).toBe('a')
        expect(registry.keyFor(3)).toBe(undefined)
    })


    test('Map methods', () => {
        registry.set('a', 1)
        registry.set('b', 2)

        expect(registry.size).toBe(2)
        expect(registry.has('a')).toBe(true)
        expect(registry.has('c')).toBe(false)

        const results = []
        registry.forEach((value, key) => {
            results.push({key, value})
        })
        expect(results).toEqual([{key: 'a', value: 1}, {key: 'b', value: 2}])
    })


    test('constructor with default collection', () => {
        const collection = {
            key1: 'value1',
            key2: 'value2'
        }
        
        const registryWithCollection = new Registry(collection)
        
        expect(registryWithCollection.size).toBe(2)
        expect(registryWithCollection.get('key1')).toBe('value1')
        expect(registryWithCollection.get('key2')).toBe('value2')
    })

})
