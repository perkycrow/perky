import {describe, test, expect} from 'vitest'
import {dedent, dedentSource} from './dedent.js'


describe('dedent', () => {

    test('removes common indentation', () => {
        const input = `
            line 1
            line 2
        `
        const result = dedent(input)
        expect(result).toBe('line 1\nline 2')
    })


    test('handles mixed indentation', () => {
        const input = `
            line 1
                line 2
            line 3
        `
        const result = dedent(input)
        expect(result).toBe('line 1\n    line 2\nline 3')
    })


    test('returns empty string for empty input', () => {
        expect(dedent('')).toBe('')
        expect(dedent('   \n   ')).toBe('')
    })


    test('handles single line', () => {
        expect(dedent('hello')).toBe('hello')
        expect(dedent('  hello')).toBe('hello')
    })


    test('preserves relative indentation', () => {
        const input = `
            function test () {
                return true
            }
        `
        const result = dedent(input)
        expect(result).toBe('function test () {\n    return true\n}')
    })


    test('trimEmptyLines option', () => {
        const input = '\n\n  hello\n\n'
        expect(dedent(input, {trimEmptyLines: true})).toBe('hello')
        expect(dedent(input, {trimEmptyLines: false})).toBe('\n\nhello\n\n')
    })


    test('preserveFirstLine option', () => {
        const input = 'first line\n    second line\n    third line'
        const result = dedent(input, {preserveFirstLine: true, trimEmptyLines: false})
        expect(result).toBe('first line\nsecond line\nthird line')
    })


    test('ignores whitespace-only lines for min indent calculation', () => {
        const input = `
            line 1

            line 2
        `
        const result = dedent(input)
        expect(result).toBe('line 1\n\nline 2')
    })

})


describe('dedentSource', () => {

    test('preserves first line and dedents rest', () => {
        const input = 'function foo () {\n        return 1\n    }'
        const result = dedentSource(input)
        expect(result).toBe('function foo () {\n    return 1\n}')
    })


    test('handles single line', () => {
        expect(dedentSource('return 1')).toBe('return 1')
    })


    test('handles no indentation', () => {
        const input = 'line 1\nline 2'
        expect(dedentSource(input)).toBe('line 1\nline 2')
    })


    test('preserves leading and trailing empty lines', () => {
        const input = '\n    line 1\n    line 2\n'
        const result = dedentSource(input)
        expect(result).toBe('\nline 1\nline 2\n')
    })

})
