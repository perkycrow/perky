/* eslint-disable max-nested-callbacks */
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

        spy.mockClear()
        registry.set('key', 'newValue')

        expect(registry.get('key')).toBe('newValue')

        expect(spy).toHaveBeenCalledTimes(2)
        expect(spy).toHaveBeenNthCalledWith(1, 'delete', 'key', 'value')
        expect(spy).toHaveBeenNthCalledWith(2, 'set', 'key', 'newValue', 'value')
    })


    test('set with same value does not emit delete', () => {
        const spy = vi.spyOn(registry, 'emit')

        registry.set('key', 'value')
        spy.mockClear()

        registry.set('key', 'value')

        expect(spy).toHaveBeenCalledTimes(1)
        expect(spy).toHaveBeenCalledWith('set', 'key', 'value', 'value')
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


    describe('Indexing', () => {

        test('addIndex creates a new index', () => {
            registry.addIndex('byName', (item) => item.name)
            expect(registry.hasIndex('byName')).toBe(true)
        })


        test('addIndex with property name string', () => {
            registry.addIndex('byName', 'name')

            registry.set('1', {name: 'Alice', age: 30})
            registry.set('2', {name: 'Bob', age: 25})

            expect(registry.lookup('byName', 'Alice')).toEqual([{name: 'Alice', age: 30}])
            expect(registry.lookup('byName', 'Bob')).toEqual([{name: 'Bob', age: 25}])
        })


        test('addIndex with single argument (property name)', () => {
            registry.addIndex('name')

            registry.set('1', {name: 'Alice', age: 30})
            registry.set('2', {name: 'Bob', age: 25})

            expect(registry.lookup('name', 'Alice')).toEqual([{name: 'Alice', age: 30}])
            expect(registry.lookup('name', 'Bob')).toEqual([{name: 'Bob', age: 25}])
        })


        test('addIndex throws if keyFunction is invalid type', () => {
            expect(() => registry.addIndex('test', 123)).toThrow(TypeError)
            expect(() => registry.addIndex('test', null)).toThrow(TypeError)
        })


        test('lookup returns empty array for non-existent key', () => {
            registry.addIndex('byName', (item) => item.name)
            expect(registry.lookup('byName', 'John')).toEqual([])
        })


        test('lookup throws if index does not exist', () => {
            expect(() => registry.lookup('nonExistent', 'key')).toThrow()
        })


        test('items are automatically added to index on set', () => {
            registry.addIndex('byName', (item) => item.name)

            registry.set('1', {name: 'Alice', age: 30})
            registry.set('2', {name: 'Bob', age: 25})

            expect(registry.lookup('byName', 'Alice')).toEqual([{name: 'Alice', age: 30}])
            expect(registry.lookup('byName', 'Bob')).toEqual([{name: 'Bob', age: 25}])
        })


        test('multiple items with same key are stored in index', () => {
            registry.addIndex('byAge', (item) => item.age)

            registry.set('1', {name: 'Alice', age: 30})
            registry.set('2', {name: 'Bob', age: 30})
            registry.set('3', {name: 'Charlie', age: 25})

            const age30 = registry.lookup('byAge', 30)
            expect(age30).toHaveLength(2)
            expect(age30).toContainEqual({name: 'Alice', age: 30})
            expect(age30).toContainEqual({name: 'Bob', age: 30})
        })


        test('items are removed from index on delete', () => {
            registry.addIndex('byName', (item) => item.name)

            registry.set('1', {name: 'Alice', age: 30})
            expect(registry.lookup('byName', 'Alice')).toHaveLength(1)

            registry.delete('1')
            expect(registry.lookup('byName', 'Alice')).toEqual([])
        })


        test('items are updated in index when replaced', () => {
            registry.addIndex('byName', (item) => item.name)

            registry.set('1', {name: 'Alice', age: 30})
            expect(registry.lookup('byName', 'Alice')).toHaveLength(1)

            registry.set('1', {name: 'Bob', age: 30})
            expect(registry.lookup('byName', 'Alice')).toEqual([])
            expect(registry.lookup('byName', 'Bob')).toHaveLength(1)
        })


        test('index can be added after items are inserted', () => {
            registry.set('1', {name: 'Alice', age: 30})
            registry.set('2', {name: 'Bob', age: 25})

            registry.addIndex('byName', (item) => item.name)

            expect(registry.lookup('byName', 'Alice')).toHaveLength(1)
            expect(registry.lookup('byName', 'Bob')).toHaveLength(1)
        })


        test('multiple indexes can coexist', () => {
            registry.addIndex('byName', (item) => item.name)
            registry.addIndex('byAge', (item) => item.age)

            registry.set('1', {name: 'Alice', age: 30})
            registry.set('2', {name: 'Bob', age: 30})

            expect(registry.lookup('byName', 'Alice')).toHaveLength(1)
            expect(registry.lookup('byAge', 30)).toHaveLength(2)
        })


        test('keyFunction can return array of keys', () => {
            registry.addIndex('byTags', (item) => item.tags)

            registry.set('1', {name: 'Post1', tags: ['javascript', 'testing']})
            registry.set('2', {name: 'Post2', tags: ['javascript', 'nodejs']})

            const jsPosts = registry.lookup('byTags', 'javascript')
            expect(jsPosts).toHaveLength(2)

            const testingPosts = registry.lookup('byTags', 'testing')
            expect(testingPosts).toHaveLength(1)
            expect(testingPosts[0].name).toBe('Post1')
        })


        test('keyFunction returning null/undefined is ignored', () => {
            registry.addIndex('byOptional', (item) => item.optional)

            registry.set('1', {name: 'Item1', optional: null})
            registry.set('2', {name: 'Item2', optional: undefined})
            registry.set('3', {name: 'Item3', optional: 'value'})

            expect(registry.lookup('byOptional', null)).toEqual([])
            expect(registry.lookup('byOptional', undefined)).toEqual([])
            expect(registry.lookup('byOptional', 'value')).toHaveLength(1)
        })


        test('removeIndex removes an index', () => {
            registry.addIndex('byName', (item) => item.name)
            expect(registry.hasIndex('byName')).toBe(true)

            registry.removeIndex('byName')
            expect(registry.hasIndex('byName')).toBe(false)
        })


        test('complex index key function', () => {
            registry.addIndex('byActionEvent', (item) =>
                `${item.action}:${item.event}`)

            registry.set('1', {action: 'jump', event: 'pressed'})
            registry.set('2', {action: 'jump', event: 'released'})
            registry.set('3', {action: 'run', event: 'pressed'})

            const jumpPressed = registry.lookup('byActionEvent', 'jump:pressed')
            expect(jumpPressed).toHaveLength(1)
            expect(jumpPressed[0].action).toBe('jump')
            expect(jumpPressed[0].event).toBe('pressed')
        })


        test('clear removes items from indexes', () => {
            registry.addIndex('byName', (item) => item.name)

            registry.set('1', {name: 'Alice'})
            registry.set('2', {name: 'Bob'})

            expect(registry.lookup('byName', 'Alice')).toHaveLength(1)

            registry.clear()

            expect(registry.lookup('byName', 'Alice')).toEqual([])
            expect(registry.lookup('byName', 'Bob')).toEqual([])
        })

    })

})
