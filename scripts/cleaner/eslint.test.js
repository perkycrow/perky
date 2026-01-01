import {describe, expect, test} from 'vitest'
import {isUnusedDirectiveMessage, removeUnusedDirective, isCleanDirective} from './eslint.js'


describe('isUnusedDirectiveMessage', () => {

    test('detects unused directive message', () => {
        expect(isUnusedDirectiveMessage('Unused eslint-disable directive')).toBe(true)
        expect(isUnusedDirectiveMessage("Unused eslint-disable directive (no problems were reported from 'no-unused-vars')")).toBe(true)
    })


    test('returns false for other messages', () => {
        expect(isUnusedDirectiveMessage('Expected indentation of 4 spaces')).toBe(false)
        expect(isUnusedDirectiveMessage('no-unused-vars')).toBe(false)
    })


    test('handles null and undefined', () => {
        expect(isUnusedDirectiveMessage(null)).toBeFalsy()
        expect(isUnusedDirectiveMessage(undefined)).toBeFalsy()
    })

})


describe('removeUnusedDirective', () => {

    test('removes inline eslint-disable-line', () => {
        const content = 'const x = 1 // eslint-disable-line no-unused-vars'
        const result = removeUnusedDirective(content, 1)

        expect(result).toBe('const x = 1')
    })


    test('removes standalone eslint-disable-next-line', () => {
        const content = '// eslint-disable-next-line no-unused-vars\nconst x = 1'
        const result = removeUnusedDirective(content, 1)

        expect(result).toBe('const x = 1')
    })


    test('removes block eslint-disable', () => {
        const content = '/* eslint-disable no-unused-vars */\nconst x = 1'
        const result = removeUnusedDirective(content, 1)

        expect(result).toBe('const x = 1')
    })


    test('handles invalid line number', () => {
        const content = 'const x = 1'
        expect(removeUnusedDirective(content, 0)).toBe(content)
        expect(removeUnusedDirective(content, 10)).toBe(content)
    })


    test('preserves content when no directive found', () => {
        const content = 'const x = 1\nconst y = 2'
        const result = removeUnusedDirective(content, 1)

        expect(result).toBe(content)
    })

})


describe('isCleanDirective', () => {

    test('detects -- clean marker', () => {
        expect(isCleanDirective('// eslint-disable-line complexity -- clean')).toBe(true)
        expect(isCleanDirective('// eslint-disable-next-line no-unused-vars -- clean')).toBe(true)
    })


    test('detects -- clean with reason', () => {
        expect(isCleanDirective('// eslint-disable-line complexity -- clean: constructor init')).toBe(true)
        expect(isCleanDirective('// eslint-disable-line complexity --clean: no space')).toBe(true)
    })


    test('returns false without clean marker', () => {
        expect(isCleanDirective('// eslint-disable-line complexity')).toBe(false)
        expect(isCleanDirective('// eslint-disable-line complexity -- some reason')).toBe(false)
    })


    test('does not match clean in other contexts', () => {
        expect(isCleanDirective('// clean up the code')).toBe(false)
        expect(isCleanDirective('const cleanup = true')).toBe(false)
    })

})
