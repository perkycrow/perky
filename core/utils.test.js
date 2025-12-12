import {describe, expect, test, beforeEach} from 'vitest'
import {
    toCamelCase,
    toPascalCase,
    toSnakeCase,
    singularize,
    uniqueId,
    resetUniqueId,
    deepMerge,
    setDefaults,
    getNestedValue,
    setNestedValue
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
