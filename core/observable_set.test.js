/* eslint-disable max-nested-callbacks */
import {describe, test, expect, beforeEach} from 'vitest'
import ObservableSet from './observable_set'


describe(ObservableSet, () => {

    let observableSet

    beforeEach(() => {
        observableSet = new ObservableSet()
    })


    describe('Constructor', () => {

        test('creates empty set when no values provided', () => {
            const set = new ObservableSet()
            expect(set.size).toBe(0)
        })


        test('creates set with initial values from array', () => {
            const set = new ObservableSet(['a', 'b', 'c'])
            expect(set.size).toBe(3)
            expect(set.has('a')).toBe(true)
            expect(set.has('b')).toBe(true)
            expect(set.has('c')).toBe(true)
        })


        test('creates set with initial values from Set', () => {
            const set = new ObservableSet(new Set([1, 2, 3]))
            expect(set.size).toBe(3)
            expect(set.has(1)).toBe(true)
            expect(set.has(2)).toBe(true)
            expect(set.has(3)).toBe(true)
        })


        test('deduplicates initial values', () => {
            const set = new ObservableSet(['a', 'b', 'a', 'c', 'b'])
            expect(set.size).toBe(3)
        })

    })


    describe('add', () => {

        test('adds value to set', () => {
            observableSet.add('test')
            expect(observableSet.has('test')).toBe(true)
            expect(observableSet.size).toBe(1)
        })


        test('returns this for chaining', () => {
            const result = observableSet.add('a')
            expect(result).toBe(observableSet)
        })


        test('allows chaining multiple adds', () => {
            observableSet.add('a').add('b').add('c')
            expect(observableSet.size).toBe(3)
        })


        test('does not add duplicate values', () => {
            observableSet.add('test')
            observableSet.add('test')
            expect(observableSet.size).toBe(1)
        })


        test('emits add event when value is added', () => {
            let emittedValue
            observableSet.on('add', (value) => {
                emittedValue = value
            })

            observableSet.add('test')
            expect(emittedValue).toBe('test')
        })


        test('does not emit add event for duplicate values', () => {
            let callCount = 0
            observableSet.on('add', () => {
                callCount++
            })

            observableSet.add('test')
            observableSet.add('test')
            expect(callCount).toBe(1)
        })

    })


    describe('delete', () => {

        test('deletes value from set', () => {
            observableSet.add('test')
            const result = observableSet.delete('test')

            expect(result).toBe(true)
            expect(observableSet.has('test')).toBe(false)
            expect(observableSet.size).toBe(0)
        })


        test('returns false when deleting non-existent value', () => {
            const result = observableSet.delete('nonexistent')
            expect(result).toBe(false)
        })


        test('emits delete event when value is deleted', () => {
            let emittedValue
            observableSet.on('delete', (value) => {
                emittedValue = value
            })

            observableSet.add('test')
            observableSet.delete('test')
            expect(emittedValue).toBe('test')
        })


        test('does not emit delete event for non-existent value', () => {
            let callCount = 0
            observableSet.on('delete', () => {
                callCount++
            })

            observableSet.delete('nonexistent')
            expect(callCount).toBe(0)
        })

    })


    describe('clear', () => {

        test('clears all values from set', () => {
            observableSet.add('a').add('b').add('c')
            observableSet.clear()

            expect(observableSet.size).toBe(0)
            expect(observableSet.has('a')).toBe(false)
        })


        test('emits clear event with all values', () => {
            let clearedValues
            observableSet.on('clear', (values) => {
                clearedValues = values
            })

            observableSet.add('a').add('b').add('c')
            observableSet.clear()

            expect(clearedValues).toEqual(['a', 'b', 'c'])
        })


        test('does not emit clear event when set is already empty', () => {
            let callCount = 0
            observableSet.on('clear', () => {
                callCount++
            })

            observableSet.clear()
            expect(callCount).toBe(0)
        })

    })


    describe('has', () => {

        test('returns true for existing value', () => {
            observableSet.add('test')
            expect(observableSet.has('test')).toBe(true)
        })


        test('returns false for non-existent value', () => {
            expect(observableSet.has('test')).toBe(false)
        })

    })


    describe('size', () => {

        test('returns 0 for empty set', () => {
            expect(observableSet.size).toBe(0)
        })


        test('returns correct size after adding values', () => {
            observableSet.add('a').add('b').add('c')
            expect(observableSet.size).toBe(3)
        })


        test('updates size after deletion', () => {
            observableSet.add('a').add('b')
            observableSet.delete('a')
            expect(observableSet.size).toBe(1)
        })

    })


    describe('Iteration', () => {

        test('values returns iterator', () => {
            observableSet.add('a').add('b').add('c')
            const values = Array.from(observableSet.values())
            expect(values).toEqual(['a', 'b', 'c'])
        })


        test('keys returns iterator', () => {
            observableSet.add('a').add('b')
            const keys = Array.from(observableSet.keys())
            expect(keys).toEqual(['a', 'b'])
        })


        test('entries returns iterator', () => {
            observableSet.add('a').add('b')
            const entries = Array.from(observableSet.entries())
            expect(entries).toEqual([['a', 'a'], ['b', 'b']])
        })


        test('forEach iterates over values', () => {
            observableSet.add('a').add('b').add('c')

            const collected = []
            observableSet.forEach((value) => {
                collected.push(value)
            })

            expect(collected).toEqual(['a', 'b', 'c'])
        })


        test('forEach with thisArg', () => {
            observableSet.add('test')

            const context = {result: null}
            observableSet.forEach(function (value) {
                this.result = value
            }, context)

            expect(context.result).toBe('test')
        })


        test('is iterable with for...of', () => {
            observableSet.add('a').add('b').add('c')

            const values = []
            for (const value of observableSet) {
                values.push(value)
            }

            expect(values).toEqual(['a', 'b', 'c'])
        })


        test('spread operator works', () => {
            observableSet.add('a').add('b').add('c')
            const values = [...observableSet]
            expect(values).toEqual(['a', 'b', 'c'])
        })

    })


    describe('toArray', () => {

        test('returns empty array for empty set', () => {
            expect(observableSet.toArray()).toEqual([])
        })


        test('returns array with all values', () => {
            observableSet.add('a').add('b').add('c')
            expect(observableSet.toArray()).toEqual(['a', 'b', 'c'])
        })


        test('returns new array each time', () => {
            observableSet.add('a')
            const arr1 = observableSet.toArray()
            const arr2 = observableSet.toArray()
            expect(arr1).not.toBe(arr2)
        })

    })


    describe('Event composition', () => {

        test('multiple listeners receive events', () => {
            let count1 = 0
            let count2 = 0

            observableSet.on('add', () => count1++)
            observableSet.on('add', () => count2++)

            observableSet.add('test')

            expect(count1).toBe(1)
            expect(count2).toBe(1)
        })


        test('can unsubscribe from events', () => {
            let count = 0
            const listener = () => count++

            observableSet.on('add', listener)
            observableSet.add('a')

            observableSet.off('add', listener)
            observableSet.add('b')

            expect(count).toBe(1)
        })

    })


    describe('Complex scenarios', () => {

        test('handles different value types', () => {
            const obj = {key: 'value'}
            const arr = [1, 2, 3]

            observableSet.add(1)
            observableSet.add('string')
            observableSet.add(obj)
            observableSet.add(arr)
            observableSet.add(null)
            observableSet.add(undefined)

            expect(observableSet.size).toBe(6)
            expect(observableSet.has(obj)).toBe(true)
            expect(observableSet.has(arr)).toBe(true)
        })


        test('maintains set semantics with object references', () => {
            const obj1 = {id: 1}
            const obj2 = {id: 1}  // Different reference, same content

            observableSet.add(obj1)
            observableSet.add(obj2)

            expect(observableSet.size).toBe(2)  // Different objects
        })

    })

})
