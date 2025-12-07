import {describe, test, expect, beforeEach} from 'vitest'
import IndexedRegistry from './indexed_registry'


describe('IndexedRegistry', () => {

    let registry

    beforeEach(() => {
        registry = new IndexedRegistry()
    })


    test('extends Registry', () => {
        expect(registry.set).toBeDefined()
        expect(registry.get).toBeDefined()
        expect(registry.delete).toBeDefined()
    })


    test('addIndex creates a new index', () => {
        registry.addIndex('byName', (item) => item.name)
        expect(registry.hasIndex('byName')).toBe(true)
    })


    test('addIndex throws if keyFunction is not a function', () => {
        expect(() => registry.addIndex('test', 'not-a-function')).toThrow(TypeError)
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
