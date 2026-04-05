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
    exportFrom,
    importTo,
    createFor,
    resolveExports,
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


    test('deepMerge preserves class instances by reference', () => {
        class Custom {
            constructor (value) {
                this.value = value
            }
        }

        const instance = new Custom(42)
        const result = deepMerge({}, {a: instance, b: {nested: instance}})

        expect(result.a).toBe(instance)
        expect(result.a).toBeInstanceOf(Custom)
        expect(result.a.value).toBe(42)
        expect(result.b.nested).toBe(instance)
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


describe('exportFrom', () => {

    test('returns primitive values as-is', () => {
        expect(exportFrom(42)).toBe(42)
        expect(exportFrom('hello')).toBe('hello')
        expect(exportFrom(true)).toBe(true)
        expect(exportFrom(null)).toBe(null)
        expect(exportFrom(undefined)).toBe(undefined)
    })


    test('calls export method if available', () => {
        const obj = {
            value: 42,
            export () {
                return {exported: this.value}
            }
        }

        expect(exportFrom(obj)).toEqual({exported: 42})
    })


    test('recursively exports arrays', () => {
        const arr = [1, 2, {value: 3, export: () => 'exported'}]

        expect(exportFrom(arr)).toEqual([1, 2, 'exported'])
    })


    test('recursively exports object properties', () => {
        const obj = {
            a: 1,
            b: {
                c: 2,
                export: () => 'nested'
            }
        }

        expect(exportFrom(obj)).toEqual({a: 1, b: 'nested'})
    })


    test('uses $exports declaration when present', () => {
        class Point {
            static $exports = ['x', 'y']
            constructor (x, y) {
                this.x = x
                this.y = y
                this.internal = 'hidden'
            }
        }

        const p = new Point(3, 5)
        expect(exportFrom(p)).toEqual({x: 3, y: 5})
    })


    test('export method takes priority over $exports', () => {
        class Hybrid {
            static $exports = ['x', 'y']
            constructor () {
                this.x = 1
                this.y = 2
            }
            export () {
                return {custom: true}
            }
        }

        expect(exportFrom(new Hybrid())).toEqual({custom: true})
    })


    test('recurses into nested objects with $exports', () => {
        class Vec {
            static $exports = ['x', 'y']
            constructor (x, y) {
                this.x = x
                this.y = y
            }
        }

        class Thing {
            static $exports = ['label', 'position']
            constructor (label, x, y) {
                this.label = label
                this.position = new Vec(x, y)
            }
        }

        expect(exportFrom(new Thing('t', 3, 5))).toEqual({
            label: 't',
            position: {x: 3, y: 5}
        })
    })


    test('walks the prototype chain for inherited $exports', () => {
        class Base {
            static $exports = ['a', 'b']
            constructor () {
                this.a = 1
                this.b = 2
            }
        }

        class Middle extends Base {
            static $exports = ['c']
            constructor () {
                super()
                this.c = 3
            }
        }

        class Leaf extends Middle {
            static $exports = ['d']
            constructor () {
                super()
                this.d = 4
            }
        }

        expect(exportFrom(new Leaf())).toEqual({a: 1, b: 2, c: 3, d: 4})
    })


    test('a child that does not redeclare $exports still exports parent fields', () => {
        class Parent {
            static $exports = ['x', 'y']
            constructor () {
                this.x = 10
                this.y = 20
            }
        }

        class Child extends Parent {}

        expect(exportFrom(new Child())).toEqual({x: 10, y: 20})
    })

})


describe('resolveExports', () => {

    test('returns empty array for null, Object, Function', () => {
        expect(resolveExports(null)).toEqual([])
        expect(resolveExports(undefined)).toEqual([])
        expect(resolveExports(Object)).toEqual([])
        expect(resolveExports(Function)).toEqual([])
    })


    test('returns empty array for a class without $exports', () => {
        class Plain {}
        expect(resolveExports(Plain)).toEqual([])
    })


    test('returns declared $exports for a base class', () => {
        class Base {
            static $exports = ['x', 'y']
        }

        expect(resolveExports(Base)).toEqual(['x', 'y'])
    })


    test('child inherits parent $exports when it does not redeclare', () => {
        class Parent {
            static $exports = ['x', 'y']
        }
        class Child extends Parent {}

        expect(resolveExports(Child)).toEqual(['x', 'y'])
    })


    test('child merges its own $exports with parent (child declares only additions)', () => {
        class Parent {
            static $exports = ['x', 'y']
        }
        class Child extends Parent {
            static $exports = ['health', 'alive']
        }

        expect(resolveExports(Child)).toEqual(['x', 'y', 'health', 'alive'])
    })


    test('three-level inheritance accumulates across the chain', () => {
        class A {
            static $exports = ['a']
        }
        class B extends A {
            static $exports = ['b']
        }
        class C extends B {
            static $exports = ['c']
        }

        expect(resolveExports(C)).toEqual(['a', 'b', 'c'])
    })


    test('deduplicates fields declared in both parent and child', () => {
        class Parent {
            static $exports = ['x', 'y', 'z']
        }
        class Child extends Parent {
            static $exports = ['y', 'w']
        }

        expect(resolveExports(Child)).toEqual(['x', 'y', 'z', 'w'])
    })


    test('results are cached (same reference on repeated calls)', () => {
        class Cached {
            static $exports = ['a', 'b']
        }

        const first = resolveExports(Cached)
        const second = resolveExports(Cached)

        expect(first).toBe(second)
    })

})


describe('importTo', () => {

    test('returns target untouched for non-object targets', () => {
        expect(importTo(null, {x: 1})).toBe(null)
        expect(importTo(undefined, {x: 1})).toBe(undefined)
        expect(importTo(42, {x: 1})).toBe(42)
    })


    test('delegates to import method when available', () => {
        let received = null
        const target = {
            import (data) {
                received = data
                return this
            }
        }

        importTo(target, {x: 1})
        expect(received).toEqual({x: 1})
    })


    test('writes $exports fields from data into target', () => {
        class Point {
            static $exports = ['x', 'y']
            constructor () {
                this.x = 0
                this.y = 0
            }
        }

        const p = new Point()
        importTo(p, {x: 3, y: 5})

        expect(p.x).toBe(3)
        expect(p.y).toBe(5)
    })


    test('ignores data keys not declared in $exports', () => {
        class Point {
            static $exports = ['x', 'y']
            constructor () {
                this.x = 0
                this.y = 0
            }
        }

        const p = new Point()
        importTo(p, {x: 3, y: 5, z: 99, rogue: 'ignored'})

        expect(p.x).toBe(3)
        expect(p.y).toBe(5)
        expect(p.z).toBeUndefined()
        expect(p.rogue).toBeUndefined()
    })


    test('skips missing keys (preserves current values)', () => {
        class Point {
            static $exports = ['x', 'y']
            constructor () {
                this.x = 10
                this.y = 20
            }
        }

        const p = new Point()
        importTo(p, {x: 3})

        expect(p.x).toBe(3)
        expect(p.y).toBe(20)
    })


    test('descends into sub-objects with $exports without replacing them', () => {
        class Vec {
            static $exports = ['x', 'y']
            constructor (x, y) {
                this.x = x
                this.y = y
            }
            distanceToOrigin () {
                return Math.sqrt(this.x * this.x + this.y * this.y)
            }
        }

        class Thing {
            static $exports = ['label', 'position']
            constructor () {
                this.label = 'a'
                this.position = new Vec(1, 1)
            }
        }

        const thing = new Thing()
        const originalVec = thing.position

        importTo(thing, {label: 'b', position: {x: 3, y: 4}})

        expect(thing.label).toBe('b')
        expect(thing.position).toBe(originalVec)            // same instance preserved
        expect(thing.position).toBeInstanceOf(Vec)
        expect(thing.position.x).toBe(3)
        expect(thing.position.y).toBe(4)
        expect(thing.position.distanceToOrigin()).toBe(5)   // methods still work
    })


    test('falls back to key copy for plain objects', () => {
        const target = {a: 1, b: 2}
        importTo(target, {a: 10, c: 30})

        expect(target).toEqual({a: 10, b: 2, c: 30})
    })


    test('roundtrip export → import preserves declared fields', () => {
        class Creature {
            static $exports = ['name', 'hp']
            constructor (name, hp) {
                this.name = name
                this.hp = hp
            }
        }

        const original = new Creature('goblin', 12)
        const snapshot = exportFrom(original)

        const restored = new Creature('empty', 0)
        importTo(restored, snapshot)

        expect(restored.name).toBe('goblin')
        expect(restored.hp).toBe(12)
    })


    test('walks the prototype chain for inherited $exports when importing', () => {
        class Base {
            static $exports = ['a', 'b']
            constructor () {
                this.a = 0
                this.b = 0
            }
        }

        class Middle extends Base {
            static $exports = ['c']
            constructor () {
                super()
                this.c = 0
            }
        }

        class Leaf extends Middle {
            static $exports = ['d']
            constructor () {
                super()
                this.d = 0
            }
        }

        const leaf = new Leaf()
        importTo(leaf, {a: 1, b: 2, c: 3, d: 4, ignored: 99})

        expect(leaf.a).toBe(1)
        expect(leaf.b).toBe(2)
        expect(leaf.c).toBe(3)
        expect(leaf.d).toBe(4)
        expect(leaf.ignored).toBeUndefined()
    })


    test('roundtrip export → import across an inheritance chain', () => {
        class Animal {
            static $exports = ['name', 'age']
            constructor (name = '', age = 0) {
                this.name = name
                this.age = age
            }
        }

        class Dog extends Animal {
            static $exports = ['breed']
            constructor (name, age, breed = '') {
                super(name, age)
                this.breed = breed
            }
        }

        const original = new Dog('Rex', 5, 'labrador')
        const snapshot = exportFrom(original)

        expect(snapshot).toEqual({name: 'Rex', age: 5, breed: 'labrador'})

        const restored = new Dog()
        importTo(restored, snapshot)

        expect(restored.name).toBe('Rex')
        expect(restored.age).toBe(5)
        expect(restored.breed).toBe('labrador')
    })

})


describe('createFor', () => {

    test('returns null for non-function inputs', () => {
        expect(createFor(null, {x: 1})).toBe(null)
        expect(createFor(undefined, {x: 1})).toBe(null)
        expect(createFor('not a class', {x: 1})).toBe(null)
        expect(createFor(42, {x: 1})).toBe(null)
    })


    test('falls back to new Class(data) by default', () => {
        class Point {
            static $exports = ['x', 'y']
            constructor (data = {}) {
                this.x = data.x ?? 0
                this.y = data.y ?? 0
            }
        }

        const instance = createFor(Point, {x: 3, y: 5})

        expect(instance).toBeInstanceOf(Point)
        expect(instance.x).toBe(3)
        expect(instance.y).toBe(5)
    })


    test('calls static create method when the class defines one', () => {
        let receivedData = null

        class CustomFactory {
            static create (data) {
                receivedData = data
                const instance = new CustomFactory()
                instance.fromSnapshot = true
                instance.payload = data
                return instance
            }
        }

        const instance = createFor(CustomFactory, {x: 1, y: 2})

        expect(receivedData).toEqual({x: 1, y: 2})
        expect(instance).toBeInstanceOf(CustomFactory)
        expect(instance.fromSnapshot).toBe(true)
        expect(instance.payload).toEqual({x: 1, y: 2})
    })


    test('static create takes priority over default new Class()', () => {
        class Controlled {
            constructor () {
                this.fromConstructor = true
            }
            static create (data) {
                const instance = new Controlled()
                instance.fromCreate = true
                instance.data = data
                return instance
            }
        }

        const instance = createFor(Controlled, {hello: 'world'})

        expect(instance.fromCreate).toBe(true)
        expect(instance.data).toEqual({hello: 'world'})
    })


    test('works with the constructor-accepts-snapshot convention', () => {
        class Vec {
            static $exports = ['x', 'y']
            constructor (input) {
                if (input && typeof input === 'object') {
                    this.x = input.x ?? 0
                    this.y = input.y ?? 0
                } else {
                    this.x = 0
                    this.y = 0
                }
            }
        }

        const original = new Vec({x: 3, y: 5})
        const snapshot = exportFrom(original)
        const restored = createFor(Vec, snapshot)

        expect(restored).toBeInstanceOf(Vec)
        expect(restored.x).toBe(3)
        expect(restored.y).toBe(5)
        expect(restored).not.toBe(original)
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
