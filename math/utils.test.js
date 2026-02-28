import {describe, test, expect} from 'vitest'
import {clamp} from './utils.js'


describe('utils', () => {

    test('clamp returns value when within range', () => {
        expect(clamp(5, 0, 10)).toBe(5)
    })


    test('clamp returns min when value is below', () => {
        expect(clamp(-3, 0, 10)).toBe(0)
    })


    test('clamp returns max when value is above', () => {
        expect(clamp(15, 0, 10)).toBe(10)
    })


    test('clamp returns min when min equals max', () => {
        expect(clamp(5, 3, 3)).toBe(3)
    })


    test('clamp works with negative ranges', () => {
        expect(clamp(-5, -10, -1)).toBe(-5)
        expect(clamp(0, -10, -1)).toBe(-1)
        expect(clamp(-20, -10, -1)).toBe(-10)
    })


    test('clamp returns boundary when value equals boundary', () => {
        expect(clamp(0, 0, 10)).toBe(0)
        expect(clamp(10, 0, 10)).toBe(10)
    })

})
