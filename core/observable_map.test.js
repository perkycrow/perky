import {describe, test, expect, beforeEach} from 'vitest'
import ObservableMap from './observable_map'


describe(ObservableMap, () => {

    let observableMap

    beforeEach(() => {
        observableMap = new ObservableMap()
    })


    describe('Constructor', () => {

        test('creates empty map when no collection provided', () => {
            const map = new ObservableMap()
            expect(map.size).toBe(0)
        })


        test('creates map with initial collection from object', () => {
            const map = new ObservableMap({a: 1, b: 2})
            expect(map.size).toBe(2)
            expect(map.get('a')).toBe(1)
            expect(map.get('b')).toBe(2)
        })


        test('creates map with initial collection from Map', () => {
            const map = new ObservableMap(new Map([['x', 10], ['y', 20]]))
            expect(map.size).toBe(2)
            expect(map.get('x')).toBe(10)
            expect(map.get('y')).toBe(20)
        })

    })


    describe('set', () => {

        test('sets key-value pair', () => {
            observableMap.set('key', 'value')
            expect(observableMap.get('key')).toBe('value')
            expect(observableMap.size).toBe(1)
        })


        test('returns true', () => {
            const result = observableMap.set('a', 1)
            expect(result).toBe(true)
        })


        test('emits set event when value is added', () => {
            let emittedKey
            let emittedValue
            let emittedOldValue

            observableMap.on('set', (key, value, oldValue) => {
                emittedKey = key
                emittedValue = value
                emittedOldValue = oldValue
            })

            observableMap.set('test', 'value')
            expect(emittedKey).toBe('test')
            expect(emittedValue).toBe('value')
            expect(emittedOldValue).toBe(undefined)
        })


        test('emits delete then set event when replacing value', () => {
            const events = []
            observableMap.on('delete', (key, value) => {
                events.push({type: 'delete', key, value})
            })
            observableMap.on('set', (key, value, oldValue) => {
                events.push({type: 'set', key, value, oldValue})
            })

            observableMap.set('key', 'value1')
            events.length = 0 // Clear after initial set

            observableMap.set('key', 'value2')

            expect(events).toEqual([
                {type: 'delete', key: 'key', value: 'value1'},
                {type: 'set', key: 'key', value: 'value2', oldValue: 'value1'}
            ])
        })


        test('does not emit delete event when setting same value', () => {
            let deleteCount = 0
            observableMap.on('delete', () => {
                deleteCount++
            })

            observableMap.set('key', 'value')
            observableMap.set('key', 'value')

            expect(deleteCount).toBe(0)
        })

    })


    describe('get', () => {

        test('returns value for existing key', () => {
            observableMap.set('test', 'value')
            expect(observableMap.get('test')).toBe('value')
        })


        test('returns undefined for non-existent key', () => {
            expect(observableMap.get('nonexistent')).toBe(undefined)
        })

    })


    describe('has', () => {

        test('returns true for existing key', () => {
            observableMap.set('test', 'value')
            expect(observableMap.has('test')).toBe(true)
        })


        test('returns false for non-existent key', () => {
            expect(observableMap.has('test')).toBe(false)
        })

    })


    describe('delete', () => {

        test('deletes key-value pair', () => {
            observableMap.set('test', 'value')
            const result = observableMap.delete('test')

            expect(result).toBe(true)
            expect(observableMap.has('test')).toBe(false)
            expect(observableMap.size).toBe(0)
        })


        test('returns false when deleting non-existent key', () => {
            const result = observableMap.delete('nonexistent')
            expect(result).toBe(false)
        })


        test('emits delete event when key is deleted', () => {
            let emittedKey
            let emittedValue

            observableMap.on('delete', (key, value) => {
                emittedKey = key
                emittedValue = value
            })

            observableMap.set('test', 'value')
            observableMap.delete('test')
            expect(emittedKey).toBe('test')
            expect(emittedValue).toBe('value')
        })


        test('does not emit delete event for non-existe>nt key', () => {
            let callCount = 0
            observableMap.on('delete', () => {
                callCount++
            })

            observableMap.delete('nonexistent')
            expect(callCount).toBe(0)
        })

    })


    describe('clear', () => {

        test('clears all key-value pairs', () => {
            observableMap.set('a', 1)
            observableMap.set('b', 2)
            observableMap.clear()

            expect(observableMap.size).toBe(0)
            expect(observableMap.has('a')).toBe(false)
        })


        test('emits delete events for all entries then clear event', () => {
            const events = []
            observableMap.on('delete', (key, value) => {
                events.push({type: 'delete', key, value})
            })
            observableMap.on('clear', () => {
                events.push({type: 'clear'})
            })

            observableMap.set('a', 1)
            observableMap.set('b', 2)
            events.length = 0 // Clear after initial sets

            observableMap.clear()

            expect(events).toEqual([
                {type: 'delete', key: 'a', value: 1},
                {type: 'delete', key: 'b', value: 2},
                {type: 'clear'}
            ])
        })


        test('does not emit events when map is already empty', () => {
            let callCount = 0
            observableMap.on('delete', () => callCount++)
            observableMap.on('clear', () => callCount++)

            observableMap.clear()
            expect(callCount).toBe(0)
        })

    })


    describe('size', () => {

        test('returns 0 for empty map', () => {
            expect(observableMap.size).toBe(0)
        })


        test('returns correct size after adding entries', () => {
            observableMap.set('a', 1)
            observableMap.set('b', 2)
            observableMap.set('c', 3)
            expect(observableMap.size).toBe(3)
        })


        test('updates size after deletion', () => {
            observableMap.set('a', 1)
            observableMap.set('b', 2)
            observableMap.delete('a')
            expect(observableMap.size).toBe(1)
        })

    })


    describe('updateKey', () => {

        test('updates key for existing entry', () => {
            observableMap.set('oldKey', 'value')
            const result = observableMap.updateKey('oldKey', 'newKey')

            expect(result).toBe(true)
            expect(observableMap.has('oldKey')).toBe(false)
            expect(observableMap.has('newKey')).toBe(true)
            expect(observableMap.get('newKey')).toBe('value')
        })


        test('emits key:updated event', () => {
            let emittedOldKey
            let emittedNewKey
            let emittedValue
            
            observableMap.on('key:updated', (oldKey, newKey, value) => {
                emittedOldKey = oldKey
                emittedNewKey = newKey
                emittedValue = value
            })

            observableMap.set('oldKey', 'value')
            observableMap.updateKey('oldKey', 'newKey')

            expect(emittedOldKey).toBe('oldKey')
            expect(emittedNewKey).toBe('newKey')
            expect(emittedValue).toBe('value')
        })


        test('returns false when updating to same key', () => {
            observableMap.set('key', 'value')
            const result = observableMap.updateKey('key', 'key')
            expect(result).toBe(false)
        })


        test('returns false when old key does not exist', () => {
            const result = observableMap.updateKey('nonexistent', 'newKey')
            expect(result).toBe(false)
        })


        test('validates item if provided', () => {
            const value1 = {id: 1}
            const value2 = {id: 2}

            observableMap.set('key1', value1)
            observableMap.set('key2', value2)

            expect(observableMap.updateKey('key1', 'newKey1', value1)).toBe(true)
            expect(observableMap.updateKey('key2', 'newKey2', value1)).toBe(false)
        })

    })


    describe('hasValue', () => {

        test('returns true for existing value', () => {
            const value = {test: true}
            observableMap.set('key', value)
            expect(observableMap.hasValue(value)).toBe(true)
        })


        test('returns false for non-existent value', () => {
            expect(observableMap.hasValue('nonexistent')).toBe(false)
        })

    })


    describe('keyFor', () => {

        test('returns key for existing value', () => {
            const value = {test: true}
            observableMap.set('key', value)
            expect(observableMap.keyFor(value)).toBe('key')
        })


        test('returns undefined for non-existent value', () => {
            expect(observableMap.keyFor('nonexistent')).toBe(undefined)
        })

    })


    describe('hasEntry', () => {

        test('returns true when key-value pair exists', () => {
            observableMap.set('key', 'value')
            expect(observableMap.hasEntry('key', 'value')).toBe(true)
        })


        test('returns false when key exists but value differs', () => {
            observableMap.set('key', 'value1')
            expect(observableMap.hasEntry('key', 'value2')).toBe(false)
        })


        test('returns false when key does not exist', () => {
            expect(observableMap.hasEntry('key', 'value')).toBe(false)
        })

    })


    describe('isKeyOf', () => {

        test('returns true when key matches value', () => {
            const value = {test: true}
            observableMap.set('key', value)
            expect(observableMap.isKeyOf('key', value)).toBe(true)
        })


        test('returns false when key does not match value', () => {
            const value = {test: true}
            observableMap.set('key1', value)
            expect(observableMap.isKeyOf('key2', value)).toBe(false)
        })

    })


    describe('Iteration', () => {

        test('keys returns iterator', () => {
            observableMap.set('a', 1)
            observableMap.set('b', 2)
            const keys = Array.from(observableMap.keys)
            expect(keys).toEqual(['a', 'b'])
        })


        test('values returns iterator', () => {
            observableMap.set('a', 1)
            observableMap.set('b', 2)
            const values = Array.from(observableMap.values)
            expect(values).toEqual([1, 2])
        })


        test('entries returns array', () => {
            observableMap.set('a', 1)
            observableMap.set('b', 2)
            expect(observableMap.entries).toEqual([['a', 1], ['b', 2]])
        })


        test('forEach iterates over entries', () => {
            observableMap.set('a', 1)
            observableMap.set('b', 2)

            const collected = []
            observableMap.forEach((value, key) => {
                collected.push({key, value})
            })

            expect(collected).toEqual([
                {key: 'a', value: 1},
                {key: 'b', value: 2}
            ])
        })


        test('forEach with thisArg', () => {
            observableMap.set('test', 'value')

            const context = {result: null}
            observableMap.forEach(function (value, key) {
                this.result = {key, value}
            }, context)

            expect(context.result).toEqual({key: 'test', value: 'value'})
        })

    })


    describe('all', () => {

        test('returns empty array for empty map', () => {
            expect(observableMap.all).toEqual([])
        })


        test('returns array with all values', () => {
            observableMap.set('a', 1)
            observableMap.set('b', 2)
            expect(observableMap.all).toEqual([1, 2])
        })

    })


    describe('toObject', () => {

        test('returns empty object for empty map', () => {
            expect(observableMap.toObject()).toEqual({})
        })


        test('returns object with all entries', () => {
            const foo = {name: 'foo'}
            const bar = {name: 'bar'}

            observableMap.set('foo', foo)
            observableMap.set('bar', bar)

            const object = observableMap.toObject()

            expect(object).toEqual({foo, bar})
        })


        test('returns new object each time', () => {
            observableMap.set('a', 1)
            const obj1 = observableMap.toObject()
            const obj2 = observableMap.toObject()
            expect(obj1).not.toBe(obj2)
        })

    })


    describe('addCollection', () => {

        test('adds object entries', () => {
            const collection = {
                foo: 'bar',
                baz: 'qux'
            }

            observableMap.addCollection(collection)
            expect(observableMap.get('foo')).toBe('bar')
            expect(observableMap.get('baz')).toBe('qux')
            expect(observableMap.size).toBe(2)
        })


        test('adds Map entries', () => {
            const map = new Map([
                ['one', 1],
                ['two', 2]
            ])

            observableMap.addCollection(map)
            expect(observableMap.get('one')).toBe(1)
            expect(observableMap.get('two')).toBe(2)
            expect(observableMap.size).toBe(2)
        })


        test('returns false for invalid collection', () => {
            expect(observableMap.addCollection(null)).toBe(false)
            expect(observableMap.addCollection(123)).toBe(false)
        })

    })


    describe('Event composition', () => {

        test('multiple listeners receive events', () => {
            let count1 = 0
            let count2 = 0

            observableMap.on('set', () => count1++)
            observableMap.on('set', () => count2++)

            observableMap.set('test', 'value')

            expect(count1).toBe(1)
            expect(count2).toBe(1)
        })


        test('can unsubscribe from events', () => {
            let count = 0
            const listener = () => count++

            observableMap.on('set', listener)
            observableMap.set('a', 1)

            observableMap.off('set', listener)
            observableMap.set('b', 2)

            expect(count).toBe(1)
        })

    })


    describe('Complex scenarios', () => {

        test('handles different value types', () => {
            const obj = {key: 'value'}
            const arr = [1, 2, 3]

            observableMap.set('num', 1)
            observableMap.set('str', 'string')
            observableMap.set('obj', obj)
            observableMap.set('arr', arr)
            observableMap.set('null', null)
            observableMap.set('undefined', undefined)

            expect(observableMap.size).toBe(6)
            expect(observableMap.get('obj')).toBe(obj)
            expect(observableMap.get('arr')).toBe(arr)
        })


        test('maintains map semantics with object references', () => {
            const obj1 = {id: 1}
            const obj2 = {id: 1}  // Different reference, same content

            observableMap.set('key1', obj1)
            observableMap.set('key2', obj2)

            expect(observableMap.hasValue(obj1)).toBe(true)
            expect(observableMap.hasValue(obj2)).toBe(true)
            expect(observableMap.size).toBe(2)
        })

    })


    describe('hasValue with shared values', () => {

        test('hasValue returns true when same value is used by multiple keys', () => {
            const sharedValue = {shared: true}

            observableMap.set('key1', sharedValue)
            observableMap.set('key2', sharedValue)

            expect(observableMap.hasValue(sharedValue)).toBe(true)
            expect(observableMap.size).toBe(2)
        })


        test('hasValue still returns true after deleting one key when value is shared', () => {
            const sharedValue = {shared: true}

            observableMap.set('key1', sharedValue)
            observableMap.set('key2', sharedValue)

            observableMap.delete('key1')

            expect(observableMap.hasValue(sharedValue)).toBe(true)
            expect(observableMap.size).toBe(1)
        })


        test('hasValue returns false only after all keys with shared value are deleted', () => {
            const sharedValue = {shared: true}

            observableMap.set('key1', sharedValue)
            observableMap.set('key2', sharedValue)
            observableMap.set('key3', sharedValue)

            observableMap.delete('key1')
            expect(observableMap.hasValue(sharedValue)).toBe(true)

            observableMap.delete('key2')
            expect(observableMap.hasValue(sharedValue)).toBe(true)

            observableMap.delete('key3')
            expect(observableMap.hasValue(sharedValue)).toBe(false)
        })


        test('hasValue works correctly when replacing a shared value', () => {
            const sharedValue = {shared: true}
            const newValue = {new: true}

            observableMap.set('key1', sharedValue)
            observableMap.set('key2', sharedValue)

            observableMap.set('key1', newValue)

            expect(observableMap.hasValue(sharedValue)).toBe(true)
            expect(observableMap.hasValue(newValue)).toBe(true)

            observableMap.set('key2', newValue)

            expect(observableMap.hasValue(sharedValue)).toBe(false)
            expect(observableMap.hasValue(newValue)).toBe(true)
        })


        test('clear removes all values from hasValue tracking', () => {
            const value1 = {id: 1}
            const value2 = {id: 2}

            observableMap.set('key1', value1)
            observableMap.set('key2', value1)
            observableMap.set('key3', value2)

            observableMap.clear()

            expect(observableMap.hasValue(value1)).toBe(false)
            expect(observableMap.hasValue(value2)).toBe(false)
        })

    })

})
