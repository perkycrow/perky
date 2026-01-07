import {describe, expect, test, beforeEach} from 'vitest'
import {
    toCamelCase,
    toPascalCase,
    toSnakeCase,
    toKebabCase,
    toHumanCase,
    singularize,
    pluralize,
    plural,
    isPlural,
    isSingular,
    uniqueId,
    resetUniqueId,
    deepMerge,
    setDefaults,
    getNestedValue,
    setNestedValue,
    delegateProperties,
    exportValue,
    formatNumber,
    formatBytes
} from './utils'


describe('String Utils', () => {

    test('toCamelCase', () => {
        expect(toCamelCase('hello_world')).toEqual('helloWorld')
        expect(toCamelCase('hello-world')).toEqual('helloWorld')
        expect(toCamelCase('hello world')).toEqual('helloWorld')
        expect(toCamelCase('HelloWorld')).toEqual('helloWorld')
        expect(toCamelCase('Hello')).toEqual('hello')
    })


    test('toPascalCase', () => {
        expect(toPascalCase('hello_world')).toEqual('HelloWorld')
        expect(toPascalCase('hello-world')).toEqual('HelloWorld')
        expect(toPascalCase('hello world')).toEqual('HelloWorld')
        expect(toPascalCase('HelloWorld')).toEqual('HelloWorld')
        expect(toPascalCase('Hello')).toEqual('Hello')
    })


    test('toSnakeCase', () => {
        expect(toSnakeCase('helloWorld')).toEqual('hello_world')
        expect(toSnakeCase('HelloWorld')).toEqual('hello_world')
        expect(toSnakeCase('hello-world')).toEqual('hello_world')
        expect(toSnakeCase('hello world')).toEqual('hello_world')
        expect(toSnakeCase('Hello')).toEqual('hello')
    })


    test('toKebabCase', () => {
        expect(toKebabCase('helloWorld')).toEqual('hello-world')
        expect(toKebabCase('HelloWorld')).toEqual('hello-world')
        expect(toKebabCase('hello_world')).toEqual('hello-world')
        expect(toKebabCase('hello world')).toEqual('hello-world')
        expect(toKebabCase('Hello')).toEqual('hello')
    })


    test('toHumanCase', () => {
        expect(toHumanCase('GettingStarted')).toEqual('Getting Started')
        expect(toHumanCase('helloWorld')).toEqual('hello World')
        expect(toHumanCase('hello_world')).toEqual('hello world')
        expect(toHumanCase('hello-world')).toEqual('hello world')
        expect(toHumanCase('HTMLParser')).toEqual('HTML Parser')
        expect(toHumanCase('Hello')).toEqual('Hello')
    })


    test('singularize', () => {
        expect(singularize('books')).toEqual('book')
        expect(singularize('cars')).toEqual('car')
        expect(singularize('houses')).toEqual('house')

        expect(singularize('boxes')).toEqual('box')
        expect(singularize('dishes')).toEqual('dish')
        expect(singularize('buses')).toEqual('bus')
        expect(singularize('wishes')).toEqual('wish')

        expect(singularize('cities')).toEqual('city')
        expect(singularize('flies')).toEqual('fly')
        expect(singularize('stories')).toEqual('story')

        expect(singularize('leaves')).toEqual('leaf')
        expect(singularize('lives')).toEqual('life')
        expect(singularize('wolves')).toEqual('wolf')

        expect(singularize('men')).toEqual('man')
        expect(singularize('women')).toEqual('woman')
        expect(singularize('children')).toEqual('child')
        expect(singularize('people')).toEqual('person')
        expect(singularize('mice')).toEqual('mouse')
        expect(singularize('feet')).toEqual('foot')
        expect(singularize('teeth')).toEqual('tooth')
        expect(singularize('cacti')).toEqual('cactus')

        expect(singularize('fish')).toEqual('fish')
        expect(singularize('deer')).toEqual('deer')
    })


    test('pluralize', () => {
        expect(pluralize('cat', 1)).toEqual('cat')
        expect(pluralize('cat', 2)).toEqual('cats')
        expect(pluralize('cat', 0)).toEqual('cats')
        expect(pluralize('child', 1)).toEqual('child')
        expect(pluralize('child', 5)).toEqual('children')
        expect(pluralize('cat', 1, true)).toEqual('1 cat')
        expect(pluralize('cat', 3, true)).toEqual('3 cats')
    })


    test('plural', () => {
        expect(plural('cat')).toEqual('cats')
        expect(plural('child')).toEqual('children')
        expect(plural('person')).toEqual('people')
        expect(plural('fish')).toEqual('fish')
    })


    test('isPlural', () => {
        expect(isPlural('cats')).toBe(true)
        expect(isPlural('children')).toBe(true)
        expect(isPlural('cat')).toBe(false)
        expect(isPlural('child')).toBe(false)
    })


    test('isSingular', () => {
        expect(isSingular('cat')).toBe(true)
        expect(isSingular('child')).toBe(true)
        expect(isSingular('cats')).toBe(false)
        expect(isSingular('children')).toBe(false)
    })


    test('uniqueId', () => {
        beforeEach(() => {
            resetUniqueId('testCollection')
            resetUniqueId('anotherCollection')
        })

        const id1 = uniqueId('testCollection', 'item')
        expect(id1).toBe('item')

        const id2 = uniqueId('testCollection', 'item')
        expect(id2).toBe('item_1')

        const id3 = uniqueId('testCollection', 'item')
        expect(id3).toBe('item_2')

        const user1 = uniqueId('testCollection', 'user')
        expect(user1).toBe('user')

        const user2 = uniqueId('testCollection', 'user')
        expect(user2).toBe('user_1')

        const product1 = uniqueId('anotherCollection', 'product')
        expect(product1).toBe('product')

        const product2 = uniqueId('anotherCollection', 'product')
        expect(product2).toBe('product_1')

        const single1 = uniqueId('single')
        expect(single1).toBe('single')

        const single2 = uniqueId('single')
        expect(single2).toBe('single_1')

        const single3 = uniqueId('single')
        expect(single3).toBe('single_2')

        const other1 = uniqueId('other')
        expect(other1).toBe('other')

        const other2 = uniqueId('other')
        expect(other2).toBe('other_1')
    })


    test('resetUniqueId', () => {
        // Start fresh
        resetUniqueId('testCollection')

        uniqueId('testCollection', 'item')
        uniqueId('testCollection', 'item')
        uniqueId('testCollection', 'user')

        resetUniqueId('testCollection', 'item')

        const newItem = uniqueId('testCollection', 'item')
        expect(newItem).toBe('item')

        const newUser = uniqueId('testCollection', 'user')
        expect(newUser).toBe('user_1')

        resetUniqueId('testCollection')

        const resetItem = uniqueId('testCollection', 'item')
        expect(resetItem).toBe('item')

        const resetUser = uniqueId('testCollection', 'user')
        expect(resetUser).toBe('user')
    })

})


describe('Object Utils', () => {

    test('deepMerge', () => {
        expect(deepMerge({a: 1}, {b: 2})).toEqual({a: 1, b: 2})
        expect(deepMerge({a: 1, b: 2}, {b: 3})).toEqual({a: 1, b: 3})

        expect(deepMerge(
            {a: {b: 1, c: 2}},
            {a: {c: 3, d: 4}}
        )).toEqual({a: {b: 1, c: 3, d: 4}})

        expect(deepMerge(
            {a: [1, 2]},
            {a: [3, 4]}
        )).toEqual({a: [1, 2, 3, 4]})

        expect(deepMerge({a: 1}, null)).toEqual({a: 1})
        expect(deepMerge({a: 1}, undefined)).toEqual({a: 1})
    })


    test('deepMerge handles circular references', () => {
        const circular = {a: 1}
        circular.self = circular

        expect(() => {
            deepMerge({}, circular)
        }).not.toThrow()

        const result = deepMerge({b: 2}, circular)
        expect(result.a).toBe(1)
        expect(result.b).toBe(2)
        expect(result.self).toBe(circular)
    })


    test('setDefaults', () => {
        expect(setDefaults({a: 1}, {a: 0, b: 2})).toEqual({a: 1, b: 2})

        expect(setDefaults(
            {a: {b: 1}},
            {a: {b: 0, c: 2}, d: 3}
        )).toEqual({a: {b: 1, c: 2}, d: 3})

        expect(setDefaults({}, {a: 1, b: 2})).toEqual({a: 1, b: 2})

        expect(setDefaults(null, {a: 1, b: 2})).toEqual({a: 1, b: 2})
        expect(setDefaults(undefined, {a: 1, b: 2})).toEqual({a: 1, b: 2})
    })


    test('getNestedValue', () => {
        const obj = {
            a: 1,
            b: {
                c: 2,
                d: {
                    e: 3
                }
            }
        }

        expect(getNestedValue(obj, 'a')).toBe(1)
        expect(getNestedValue(obj, 'b.c')).toBe(2)
        expect(getNestedValue(obj, 'b.d.e')).toBe(3)

        expect(getNestedValue(obj, 'x')).toBeUndefined()
        expect(getNestedValue(obj, 'b.x')).toBeUndefined()
        expect(getNestedValue(obj, 'b.d.x')).toBeUndefined()

        expect(getNestedValue(obj)).toEqual(obj)
    })


    test('setNestedValue', () => {
        const obj = {}

        setNestedValue(obj, 'a', 1)
        expect(obj).toEqual({a: 1})

        setNestedValue(obj, 'b.c', 2)
        expect(obj.b.c).toBe(2)

        setNestedValue(obj, 'b.c', 3)
        expect(obj.b.c).toBe(3)

        setNestedValue(obj, 'b.d.e', 4)
        expect(obj.b.d.e).toBe(4)
        expect(obj).toEqual({a: 1, b: {c: 3, d: {e: 4}}})
    })

})


describe('delegateProperties', () => {

    test('delegates methods with array notation', () => {
        const source = {
            method1: () => 'result1',
            method2: () => 'result2'
        }
        const receiver = {}

        delegateProperties(receiver, source, ['method1', 'method2'])

        expect(receiver.method1()).toBe('result1')
        expect(receiver.method2()).toBe('result2')
    })


    test('delegates properties with array notation', () => {
        const source = {prop1: 'value1', prop2: 'value2'}
        const receiver = {}

        delegateProperties(receiver, source, ['prop1', 'prop2'])

        expect(receiver.prop1).toBe('value1')
        expect(receiver.prop2).toBe('value2')
    })


    test('property changes reflect on source', () => {
        const source = {prop: 'initial'}
        const receiver = {}

        delegateProperties(receiver, source, ['prop'])

        receiver.prop = 'changed'
        expect(source.prop).toBe('changed')
    })


    test('delegates with object notation (aliasing)', () => {
        const source = {
            originalMethod: () => 'result',
            originalProp: 'value'
        }
        const receiver = {}

        delegateProperties(receiver, source, {
            originalMethod: 'aliasedMethod',
            originalProp: 'aliasedProp'
        })

        expect(receiver.aliasedMethod()).toBe('result')
        expect(receiver.aliasedProp).toBe('value')
    })


    test('delegates getters and setters', () => {
        let internalValue = 10
        const source = {}
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

        const receiver = {}
        delegateProperties(receiver, source, ['value'])

        expect(receiver.value).toBe(10)
        receiver.value = 20
        expect(internalValue).toBe(20)
        expect(receiver.value).toBe(20)
    })


    test('methods are bound to source context', () => {
        const source = {
            name: 'source',
            getName () {
                return this.name
            }
        }
        const receiver = {name: 'receiver'}

        delegateProperties(receiver, source, ['getName'])

        expect(receiver.getName()).toBe('source')
    })

})


describe('exportValue', () => {

    test('returns primitive values as-is', () => {
        expect(exportValue(42)).toBe(42)
        expect(exportValue('hello')).toBe('hello')
        expect(exportValue(true)).toBe(true)
        expect(exportValue(null)).toBe(null)
        expect(exportValue(undefined)).toBe(undefined)
    })


    test('calls export method if available', () => {
        const obj = {
            value: 42,
            export () {
                return {exported: this.value}
            }
        }

        expect(exportValue(obj)).toEqual({exported: 42})
    })


    test('recursively exports arrays', () => {
        const arr = [1, 2, {value: 3, export: () => 'exported'}]

        expect(exportValue(arr)).toEqual([1, 2, 'exported'])
    })


    test('recursively exports object properties', () => {
        const obj = {
            a: 1,
            b: {
                c: 2,
                export: () => 'nested'
            }
        }

        expect(exportValue(obj)).toEqual({a: 1, b: 'nested'})
    })

})


describe('formatNumber', () => {

    test('formats integers without decimals', () => {
        expect(formatNumber(42)).toBe('42')
        expect(formatNumber(1000)).toBe('1000')
        expect(formatNumber(0)).toBe('0')
    })


    test('formats floats with 2 decimal places', () => {
        expect(formatNumber(3.14159)).toBe('3.14')
        expect(formatNumber(42.5)).toBe('42.50')
        expect(formatNumber(0.123)).toBe('0.12')
    })


    test('handles non-numbers', () => {
        expect(formatNumber('hello')).toBe('hello')
        expect(formatNumber(null)).toBe('null')
    })

})


describe('formatBytes', () => {

    test('formats 0 bytes', () => {
        expect(formatBytes(0)).toBe('0 B')
    })


    test('formats bytes', () => {
        expect(formatBytes(500)).toBe('500 B')
        expect(formatBytes(1023)).toBe('1023 B')
    })


    test('formats kilobytes', () => {
        expect(formatBytes(1024)).toBe('1 KB')
        expect(formatBytes(2048)).toBe('2 KB')
    })


    test('formats megabytes', () => {
        expect(formatBytes(1024 * 1024)).toBe('1.00 MB')
        expect(formatBytes(1.5 * 1024 * 1024)).toBe('1.50 MB')
    })


    test('formats gigabytes', () => {
        expect(formatBytes(1024 * 1024 * 1024)).toBe('1.00 GB')
        expect(formatBytes(2.5 * 1024 * 1024 * 1024)).toBe('2.50 GB')
    })

})
