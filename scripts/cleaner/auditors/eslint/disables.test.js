import {describe, expect, test} from 'vitest'
import {isCleanDirective} from './disables.js'


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
