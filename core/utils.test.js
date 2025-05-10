import {
    getUrlExt,
    filterKeys,
    interpolate,
    clamp,
    normalize,
    remap,
    smoothstep,
    easeIn,
    easeOut,
    easeInOut,
    randomBetween,
    randomIntBetween,
    randomPick,
    weightedChoice,
    sum,
    pluck,
    compact,
    formatNumber,
    numberToRoman,
    compileText,
    distanceTo,
    toCamelCase,
    toPascalCase,
    toSnakeCase,
    singularize,
    pluralize,
    deepMerge,
    setDefaults,
    getNestedValue,
    setNestedValue,
    uniqueId,
    resetUniqueId
} from './utils'


describe('Utils', () => {

    test('getUrlExt', () => {
        expect(getUrlExt('http://www.google.com/logo.png')).toEqual('png')
    })


    test('filterKeys', () => {
        expect(filterKeys({a: 1, b: 2, c: 3}, ['a', 'c'])).toEqual({a: 1, c: 3})
    })


    test('interpolate', () => {
        expect(interpolate(0, 10, 0.5)).toEqual(5)
    })


    test('clamp', () => {
        expect(clamp(5, 0, 10)).toEqual(5)
        expect(clamp(-5, 0, 10)).toEqual(0)
        expect(clamp(15, 0, 10)).toEqual(10)
    })


    test('normalize', () => {
        expect(normalize(5, 0, 10)).toEqual(0.5)
    })


    test('remap', () => {
        expect(remap(5, 0, 10, 0, 100)).toEqual(50)
    })


    test('smoothstep', () => {
        expect(smoothstep(5, 0, 10)).toEqual(0.5)
        expect(smoothstep(-5, 0, 10)).toEqual(0)
        expect(smoothstep(15, 0, 10)).toEqual(1)
    })


    test('easeIn', () => {
        expect(easeIn(0.5)).toEqual(0.25)
        expect(easeIn(0)).toEqual(0)
        expect(easeIn(1)).toEqual(1)
    })


    test('easeOut', () => {
        expect(easeOut(0.5)).toEqual(0.75)
        expect(easeOut(0)).toEqual(0)
        expect(easeOut(1)).toEqual(1)
    })


    test('easeInOut', () => {
        expect(easeInOut(0.5)).toEqual(0.5)
        expect(easeInOut(0)).toEqual(0)
        expect(easeInOut(1)).toEqual(1)
    })


    test('randomBetween', () => {
        const value = randomBetween(0, 10)
        expect(value).toBeGreaterThanOrEqual(0)
        expect(value).toBeLessThanOrEqual(10)
    })


    test('randomIntBetween', () => {
        const value = randomIntBetween(0, 10)
        expect(value).toBeGreaterThanOrEqual(0)
        expect(value).toBeLessThanOrEqual(10)
        expect(value).toEqual(Math.floor(value))
    })


    test('randomPick', () => {
        const value = randomPick([1, 2, 3, 4, 5])
        expect(value).toBeGreaterThanOrEqual(1)
        expect(value).toBeLessThanOrEqual(5)
    })


    test('weightedChoice', () => {
        const valuesCount = {
            hello: 0,
            world: 0
        }

        for (let i = 0; i < 100; i++) {
            const value = weightedChoice([{value: 'hello', weight: 1}, {value: 'world', weight: 10}])
            valuesCount[value] += 1
        }

        expect(valuesCount.hello).toBeLessThan(valuesCount.world)
    })


    test('sum', () => {
        expect(sum([1, 2, 3, 4, 5])).toEqual(15)
    })


    test('pluck', () => {
        expect(pluck([{a: 1}, {a: 2}, {a: 3}], 'a')).toEqual([1, 2, 3])
    })


    test('compact', () => {
        expect(compact([0, 1, 2, 3, null, undefined, 4, 5])).toEqual([0, 1, 2, 3, 4, 5])
    })


    test('formatNumber', () => {
        expect(formatNumber(1234567)).toEqual('1\u202f234\u202f567')
    })


    test('numberToRoman', () => {
        expect(numberToRoman(1)).toEqual('I')
        expect(numberToRoman(2)).toEqual('II')
        expect(numberToRoman(3)).toEqual('III')
        expect(numberToRoman(4)).toEqual('IV')
        expect(numberToRoman(5)).toEqual('V')
        expect(numberToRoman(1245)).toEqual('MCCXLV')
    })


    test('compileText', () => {
        expect(compileText('Hello, {{name}}!', {name: 'World'})).toEqual('Hello, World!')
    })


    test('distanceTo', () => {
        expect(distanceTo({x: 0, y: 0}, {x: 3, y: 4})).toEqual(5)
        expect(distanceTo({x: 0, y: 0}, {x: 0, y: 0})).toEqual(0)
        expect(distanceTo({x: 0, y: 0}, {x: 10, y: 0})).toEqual(10)
    })


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


    test('pluralize', () => {
        expect(pluralize('book')).toEqual('books')
        expect(pluralize('car')).toEqual('cars')
        expect(pluralize('house')).toEqual('houses')

        expect(pluralize('box')).toEqual('boxes')
        expect(pluralize('dish')).toEqual('dishes')
        expect(pluralize('bus')).toEqual('buses')
        expect(pluralize('wish')).toEqual('wishes')

        expect(pluralize('city')).toEqual('cities')
        expect(pluralize('fly')).toEqual('flies')
        expect(pluralize('story')).toEqual('stories')

        expect(pluralize('leaf')).toEqual('leaves')
        expect(pluralize('life')).toEqual('lives')
        expect(pluralize('wolf')).toEqual('wolves')

        expect(pluralize('man')).toEqual('men')
        expect(pluralize('woman')).toEqual('women')
        expect(pluralize('child')).toEqual('children')
        expect(pluralize('person')).toEqual('people')
        expect(pluralize('mouse')).toEqual('mice')
        expect(pluralize('foot')).toEqual('feet')
        expect(pluralize('tooth')).toEqual('teeth')
        expect(pluralize('cactus')).toEqual('cacti')

        expect(pluralize('fish')).toEqual('fish')
        expect(pluralize('deer')).toEqual('deer')
    })


    test('deepMerge', () => {
        expect(deepMerge({a: 1}, {b: 2})).toEqual({a: 1, b: 2})
        expect(deepMerge({a: 1, b: 2}, {b: 3})).toEqual({a: 1, b: 3})

        expect(deepMerge(
            {a: 1, b: {c: 2, d: 3}}, 
            {b: {d: 4, e: 5}}
        )).toEqual({a: 1, b: {c: 2, d: 4, e: 5}})

        expect(deepMerge(
            {a: [1, 2, 3]},
            {a: [4, 5]}
        )).toEqual({a: [1, 2, 3, 4, 5]})

        expect(deepMerge({a: 1}, null)).toEqual({a: 1})
        expect(deepMerge({a: 1}, undefined)).toEqual({a: 1})
    })


    test('setDefaults', () => {
        expect(setDefaults({a: 1}, {a: 0, b: 2})).toEqual({a: 1, b: 2})

        expect(setDefaults(
            {a: 1, b: {c: 3}}, 
            {a: 0, b: {c: 2, d: 4}, e: 5}
        )).toEqual({a: 1, b: {c: 3, d: 4}, e: 5})

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

        let obj = {}
        setNestedValue(obj, 'a', 1)
        expect(obj.a).toBe(1)

        obj = {}
        setNestedValue(obj, 'a.b.c', 2)
        expect(obj.a.b.c).toBe(2)

        obj = {a: {b: {c: 1}}}
        setNestedValue(obj, 'a.b.c', 3)
        expect(obj.a.b.c).toBe(3)

        obj = {a: {}}
        setNestedValue(obj, 'a.b.c', 4)
        expect(obj.a.b.c).toBe(4)
    })


    test('uniqueId', () => {
        resetUniqueId('testCollection')
        resetUniqueId('default')
        
        const id1 = uniqueId('testCollection', 'item')
        expect(id1).toEqual('item')
        
        const id2 = uniqueId('testCollection', 'item')
        expect(id2).toEqual('item_1')
        
        const id3 = uniqueId('testCollection', 'item')
        expect(id3).toEqual('item_2')
        
        const user1 = uniqueId('testCollection', 'user')
        expect(user1).toEqual('user')
        
        const user2 = uniqueId('testCollection', 'user')
        expect(user2).toEqual('user_1')
        
        const product1 = uniqueId('anotherCollection', 'product')
        expect(product1).toEqual('product')
        
        const product2 = uniqueId('anotherCollection', 'product')
        expect(product2).toEqual('product_1')

        // Test single parameter cases
        const single1 = uniqueId('single')
        expect(single1).toEqual('single')
        
        const single2 = uniqueId('single')
        expect(single2).toEqual('single_1')
        
        const single3 = uniqueId('single')
        expect(single3).toEqual('single_2')
        
        const other1 = uniqueId('other')
        expect(other1).toEqual('other')
        
        const other2 = uniqueId('other')
        expect(other2).toEqual('other_1')
    })


    test('resetUniqueId', () => {
        resetUniqueId('testCollection')
        
        uniqueId('testCollection', 'item')
        uniqueId('testCollection', 'item')
        uniqueId('testCollection', 'user')
        
        resetUniqueId('testCollection', 'item')
        
        const newItem = uniqueId('testCollection', 'item')
        expect(newItem).toEqual('item')
        
        const newUser = uniqueId('testCollection', 'user')
        expect(newUser).toEqual('user_1')
        
        resetUniqueId('testCollection')
        
        const resetItem = uniqueId('testCollection', 'item')
        expect(resetItem).toEqual('item')
        
        const resetUser = uniqueId('testCollection', 'user')
        expect(resetUser).toEqual('user')
    })

})
