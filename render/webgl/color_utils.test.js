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

})