import {describe, expect, test} from 'vitest'
import {
    isExcludedFile,
    isProtectedComment,
    isInsideString,
    shouldSkipDirectory,
    groupBy
} from './utils.js'


describe('isExcludedFile', () => {

    test('excludes test files', () => {
        expect(isExcludedFile('core/utils.test.js')).toBe(true)
        expect(isExcludedFile('some/path/file.test.js')).toBe(true)
    })


    test('does not exclude regular files', () => {
        expect(isExcludedFile('core/utils.js')).toBe(false)
        expect(isExcludedFile('game/entity.js')).toBe(false)
        expect(isExcludedFile('scripts/cleaner/comments.js')).toBe(false)
        expect(isExcludedFile('scripts/cleaner.js')).toBe(false)
    })

})


describe('isProtectedComment', () => {

    test('protects eslint directives', () => {
        expect(isProtectedComment('eslint-disable')).toBe(true)
        expect(isProtectedComment('eslint-enable')).toBe(true)
        expect(isProtectedComment('eslint-disable-next-line no-unused-vars')).toBe(true)
    })


    test('protects typescript directives', () => {
        expect(isProtectedComment('@ts-ignore')).toBe(true)
        expect(isProtectedComment('@ts-expect-error')).toBe(true)
    })


    test('protects vitest environment', () => {
        expect(isProtectedComment('@vitest-environment jsdom')).toBe(true)
    })


    test('does not protect regular comments', () => {
        expect(isProtectedComment('this is a comment')).toBe(false)
        expect(isProtectedComment('TODO: fix this')).toBe(false)
    })

})


describe('isInsideString', () => {

    test('detects inside double quotes', () => {
        expect(isInsideString('const x = "')).toBe(true)
        expect(isInsideString('const x = "hello')).toBe(true)
    })


    test('detects inside single quotes', () => {
        expect(isInsideString("const x = '")).toBe(true)
        expect(isInsideString("const x = 'hello")).toBe(true)
    })


    test('detects inside backticks', () => {
        expect(isInsideString('const x = `')).toBe(true)
        expect(isInsideString('const x = `hello')).toBe(true)
    })


    test('detects closed strings', () => {
        expect(isInsideString('const x = "hello"')).toBe(false)
        expect(isInsideString("const x = 'hello'")).toBe(false)
        expect(isInsideString('const x = `hello`')).toBe(false)
    })


    test('handles empty string', () => {
        expect(isInsideString('')).toBe(false)
    })

})


describe('shouldSkipDirectory', () => {

    test('skips node_modules', () => {
        expect(shouldSkipDirectory('node_modules')).toBe(true)
    })


    test('skips hidden directories', () => {
        expect(shouldSkipDirectory('.git')).toBe(true)
        expect(shouldSkipDirectory('.vscode')).toBe(true)
    })


    test('does not skip regular directories', () => {
        expect(shouldSkipDirectory('src')).toBe(false)
        expect(shouldSkipDirectory('scripts')).toBe(false)
    })

})


describe('groupBy', () => {

    test('groups items by key function', () => {
        const items = [
            {type: 'a', value: 1},
            {type: 'b', value: 2},
            {type: 'a', value: 3}
        ]

        const result = groupBy(items, i => i.type)

        expect(result).toEqual({
            a: [{type: 'a', value: 1}, {type: 'a', value: 3}],
            b: [{type: 'b', value: 2}]
        })
    })


    test('handles empty array', () => {
        expect(groupBy([], i => i.type)).toEqual({})
    })


    test('handles single item', () => {
        const items = [{type: 'a', value: 1}]
        const result = groupBy(items, i => i.type)

        expect(result).toEqual({
            a: [{type: 'a', value: 1}]
        })
    })

})
