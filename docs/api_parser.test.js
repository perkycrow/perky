import {describe, it, expect} from 'vitest'
import {parseSourceFile, getApiForFile} from './api_parser.js'


describe('api_parser', () => {

    describe('parseSourceFile', () => {

        it('should parse a simple class', () => {
            const source = `
                export default class Foo {
                    static $category = 'foo'

                    constructor (options) {
                        this.options = options
                    }

                    start () {
                        return true
                    }

                    get running () {
                        return this._running
                    }

                    set running (value) {
                        this._running = value
                    }
                }
            `

            const result = parseSourceFile(source, 'foo.js')

            expect(result.file).toBe('foo.js')
            expect(result.classes).toHaveLength(1)

            const cls = result.classes[0]
            expect(cls.name).toBe('Foo')
            expect(cls.isDefault).toBe(true)
            expect(cls.statics).toHaveLength(1)
            expect(cls.statics[0].name).toBe('$category')
            expect(cls.constructor).not.toBeNull()
            expect(cls.constructor.params).toEqual(['options'])
            expect(cls.methods).toHaveLength(1)
            expect(cls.methods[0].name).toBe('start')
            expect(cls.getters).toHaveLength(1)
            expect(cls.getters[0].name).toBe('running')
            expect(cls.setters).toHaveLength(1)
            expect(cls.setters[0].name).toBe('running')
        })


        it('should skip private members', () => {
            const source = `
                class Bar {
                    #privateField = 1
                    publicField = 2

                    #privateMethod () {}
                    publicMethod () {}

                    get #privateGetter () {}
                    get publicGetter () {}
                }
            `

            const result = parseSourceFile(source)
            const cls = result.classes[0]

            expect(cls.statics).toHaveLength(0)
            expect(cls.methods).toHaveLength(1)
            expect(cls.methods[0].name).toBe('publicMethod')
            expect(cls.getters).toHaveLength(1)
            expect(cls.getters[0].name).toBe('publicGetter')
        })


        it('should parse class inheritance', () => {
            const source = `
                class Child extends Parent {
                    foo () {}
                }
            `

            const result = parseSourceFile(source)
            expect(result.classes[0].extends).toBe('Parent')
        })


        it('should parse exported functions', () => {
            const source = `
                export function doSomething (a, b = 10, ...rest) {
                    return a + b
                }
            `

            const result = parseSourceFile(source)

            expect(result.functions).toHaveLength(1)
            expect(result.functions[0].name).toBe('doSomething')
            expect(result.functions[0].params).toEqual(['a', 'b = ...', '...rest'])
        })


        it('should parse named exports', () => {
            const source = `
                export const FOO = 'bar'
            `

            const result = parseSourceFile(source)

            expect(result.exports).toHaveLength(1)
            expect(result.exports[0].name).toBe('FOO')
            expect(result.exports[0].kind).toBe('variable')
        })


        it('should include line numbers', () => {
            const source = `class Test {
    foo () {}
}`
            const result = parseSourceFile(source)

            expect(result.classes[0].line).toBe(1)
            expect(result.classes[0].methods[0].line).toBe(2)
        })


        it('should extract source code', () => {
            const source = `class Test {
    get value () {
        return 42
    }
}`
            const result = parseSourceFile(source)
            const getter = result.classes[0].getters[0]

            expect(getter.source).toContain('get value')
            expect(getter.source).toContain('return 42')
        })

    })


    describe('getApiForFile', () => {

        it('should return class type for single class', () => {
            const source = `
                export default class Foo {
                    bar () {}
                }
            `

            const api = getApiForFile(source, 'foo.js')

            expect(api.type).toBe('class')
            expect(api.name).toBe('Foo')
            expect(api.file).toBe('foo.js')
        })


        it('should return module type for multiple classes', () => {
            const source = `
                export class Foo {}
                export class Bar {}
            `

            const api = getApiForFile(source)

            expect(api.type).toBe('module')
            expect(api.classes).toHaveLength(2)
        })


        it('should return module type for functions only', () => {
            const source = `
                export function foo () {}
                export function bar () {}
            `

            const api = getApiForFile(source)

            expect(api.type).toBe('module')
            expect(api.functions).toHaveLength(2)
        })


        it('should return null for empty file', () => {
            const api = getApiForFile('')

            expect(api).toBeNull()
        })

    })

})
