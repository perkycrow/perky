import {describe, expect, test} from 'vitest'
import {PROTECTED_COMMENT_PATTERNS, EXCLUSIONS} from './config.js'


describe('PROTECTED_COMMENT_PATTERNS', () => {

    test('matches eslint-disable', () => {
        const matches = PROTECTED_COMMENT_PATTERNS.some(p => p.test('eslint-disable'))
        expect(matches).toBe(true)
    })


    test('matches eslint-enable', () => {
        const matches = PROTECTED_COMMENT_PATTERNS.some(p => p.test('eslint-enable'))
        expect(matches).toBe(true)
    })


    test('matches @ts-ignore', () => {
        const matches = PROTECTED_COMMENT_PATTERNS.some(p => p.test('@ts-ignore'))
        expect(matches).toBe(true)
    })


    test('matches @vitest-environment', () => {
        const matches = PROTECTED_COMMENT_PATTERNS.some(p => p.test('@vitest-environment jsdom'))
        expect(matches).toBe(true)
    })

})


describe('EXCLUSIONS', () => {

    test('has default exclusions', () => {
        expect(EXCLUSIONS.default).toBeDefined()
        expect(Array.isArray(EXCLUSIONS.default)).toBe(true)
    })


    test('default excludes test files', () => {
        const testFilePattern = EXCLUSIONS.default.find(p => p instanceof RegExp && p.test('foo.test.js'))
        expect(testFilePattern).toBeDefined()
    })


    test('has console exclusions', () => {
        expect(EXCLUSIONS.console).toBeDefined()
        expect(Array.isArray(EXCLUSIONS.console)).toBe(true)
    })


    test('console excludes scripts', () => {
        const scriptsPattern = EXCLUSIONS.console.find(p => p instanceof RegExp && p.test('scripts/cleaner.js'))
        expect(scriptsPattern).toBeDefined()
    })


    test('has privacy exclusions', () => {
        expect(EXCLUSIONS.privacy).toBeDefined()
    })


    test('has eslint exclusions', () => {
        expect(EXCLUSIONS.eslint).toBeDefined()
    })


    test('has tests exclusions', () => {
        expect(EXCLUSIONS.tests).toBeDefined()
    })

})
