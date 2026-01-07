import {describe, test, expect} from 'vitest'
import {parseTestFile, getTestsForFile} from './test_parser.js'


describe('parseTestFile', () => {

    test('parses describe block', () => {
        const source = `
            describe('MyClass', () => {
                test('does something', () => {
                    expect(true).toBe(true)
                })
            })
        `

        const result = parseTestFile(source, 'test.js')

        expect(result.file).toBe('test.js')
        expect(result.describes).toHaveLength(1)
        expect(result.describes[0].title).toBe('MyClass')
    })


    test('parses test cases', () => {
        const source = `
            describe('Tests', () => {
                test('first test', () => {
                    const x = 1
                })

                test('second test', () => {
                    const y = 2
                })
            })
        `

        const result = parseTestFile(source)
        const tests = result.describes[0].tests

        expect(tests).toHaveLength(2)
        expect(tests[0].title).toBe('first test')
        expect(tests[1].title).toBe('second test')
    })


    test('parses beforeEach hook', () => {
        const source = `
            describe('Tests', () => {
                beforeEach(() => {
                    setup()
                })

                test('test', () => {})
            })
        `

        const result = parseTestFile(source)

        expect(result.describes[0].beforeEach).not.toBeNull()
        expect(result.describes[0].beforeEach.source).toContain('setup()')
    })


    test('parses afterEach hook', () => {
        const source = `
            describe('Tests', () => {
                afterEach(() => {
                    cleanup()
                })

                test('test', () => {})
            })
        `

        const result = parseTestFile(source)

        expect(result.describes[0].afterEach).not.toBeNull()
        expect(result.describes[0].afterEach.source).toContain('cleanup()')
    })


    test('parses nested describes', () => {
        const source = `
            describe('Outer', () => {
                describe('Inner', () => {
                    test('nested test', () => {})
                })
            })
        `

        const result = parseTestFile(source)

        expect(result.describes[0].describes).toHaveLength(1)
        expect(result.describes[0].describes[0].title).toBe('Inner')
    })


    test('captures line numbers', () => {
        const source = `describe('Test', () => {
    test('case', () => {})
})`

        const result = parseTestFile(source)

        expect(result.describes[0].line).toBe(1)
        expect(result.describes[0].tests[0].line).toBe(2)
    })


    test('extracts test body source', () => {
        const source = `
            describe('Tests', () => {
                test('example', () => {
                    const result = add(1, 2)
                    expect(result).toBe(3)
                })
            })
        `

        const result = parseTestFile(source)
        const testSource = result.describes[0].tests[0].source

        expect(testSource).toContain('const result = add(1, 2)')
        expect(testSource).toContain('expect(result).toBe(3)')
    })


    test('handles identifier as title', () => {
        const source = `
            describe(ClassName, () => {
                test('test', () => {})
            })
        `

        const result = parseTestFile(source)

        expect(result.describes[0].title).toBe('ClassName')
    })


    test('returns empty describes for non-test file', () => {
        const source = `
            const x = 1
            export default x
        `

        const result = parseTestFile(source)

        expect(result.describes).toEqual([])
    })

})


describe('getTestsForFile', () => {

    test('returns parsed tests', () => {
        const source = `
            describe('Test', () => {
                test('case', () => {})
            })
        `

        const result = getTestsForFile(source, 'test.js')

        expect(result).not.toBeNull()
        expect(result.file).toBe('test.js')
        expect(result.describes).toHaveLength(1)
    })


    test('returns null for empty describes', () => {
        const source = 'const x = 1'

        const result = getTestsForFile(source)

        expect(result).toBeNull()
    })

})
