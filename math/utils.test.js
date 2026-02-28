import {describe, test, expect} from 'vitest'
import {clamp, snap} from './utils.js'


describe('clamp', () => {

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


describe('snap', () => {

    test('snaps to nearest step', () => {
        expect(snap(0.3, 0.25)).toBeCloseTo(0.25)
        expect(snap(0.4, 0.25)).toBeCloseTo(0.5)
        expect(snap(0.1, 0.25)).toBeCloseTo(0)
    })


    test('returns exact value when already on grid', () => {
        expect(snap(0.5, 0.25)).toBeCloseTo(0.5)
        expect(snap(1.0, 0.25)).toBeCloseTo(1.0)
        expect(snap(0, 0.25)).toBe(0)
    })


    test('works with negative values', () => {
        expect(snap(-0.3, 0.25)).toBeCloseTo(-0.25)
        expect(snap(-0.4, 0.25)).toBeCloseTo(-0.5)
    })


    test('works with integer step', () => {
        expect(snap(1.7, 1)).toBe(2)
        expect(snap(1.3, 1)).toBe(1)
    })

})
