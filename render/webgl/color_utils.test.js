import {describe, test, expect} from 'vitest'
import {parseColor} from './color_utils.js'


describe(parseColor, () => {

    test('parses hex color', () => {
        const result = parseColor('#ff8040')
        expect(result.r).toBeCloseTo(1)
        expect(result.g).toBeCloseTo(0.502, 2)
        expect(result.b).toBeCloseTo(0.251, 2)
        expect(result.a).toBe(1)
    })


    test('parses black', () => {
        const result = parseColor('#000000')
        expect(result).toEqual({r: 0, g: 0, b: 0, a: 1})
    })


    test('parses white', () => {
        const result = parseColor('#ffffff')
        expect(result.r).toBeCloseTo(1)
        expect(result.g).toBeCloseTo(1)
        expect(result.b).toBeCloseTo(1)
        expect(result.a).toBe(1)
    })


    test('returns black for non-hex color', () => {
        const result = parseColor('red')
        expect(result).toEqual({r: 0, g: 0, b: 0, a: 1})
    })


    test('parses hsl color', () => {
        const result = parseColor('hsl(0, 100, 50)')
        expect(result.r).toBeCloseTo(1)
        expect(result.g).toBeCloseTo(0)
        expect(result.b).toBeCloseTo(0)
        expect(result.a).toBe(1)
    })


    test('parses hsl green', () => {
        const result = parseColor('hsl(120, 100, 50)')
        expect(result.r).toBeCloseTo(0)
        expect(result.g).toBeCloseTo(1)
        expect(result.b).toBeCloseTo(0)
        expect(result.a).toBe(1)
    })


    test('parses hsl blue', () => {
        const result = parseColor('hsl(240, 100, 50)')
        expect(result.r).toBeCloseTo(0)
        expect(result.g).toBeCloseTo(0)
        expect(result.b).toBeCloseTo(1)
        expect(result.a).toBe(1)
    })


    test('parses hsl grayscale when saturation is 0', () => {
        const result = parseColor('hsl(0, 0, 50)')
        expect(result.r).toBeCloseTo(0.5)
        expect(result.g).toBeCloseTo(0.5)
        expect(result.b).toBeCloseTo(0.5)
        expect(result.a).toBe(1)
    })


    test('parses hsl with percent signs', () => {
        const result = parseColor('hsl(180, 100%, 50%)')
        expect(result.r).toBeCloseTo(0)
        expect(result.g).toBeCloseTo(1)
        expect(result.b).toBeCloseTo(1)
        expect(result.a).toBe(1)
    })

})