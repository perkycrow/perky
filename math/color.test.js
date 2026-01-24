import {describe, test, expect} from 'vitest'
import Color from './color.js'


describe('Color', () => {

    describe('constructor', () => {

        test('creates color with default values', () => {
            const color = new Color()
            expect(color.r).toBe(0)
            expect(color.g).toBe(0)
            expect(color.b).toBe(0)
            expect(color.a).toBe(1)
        })


        test('creates color from hex string', () => {
            const color = new Color('#ff0000')
            expect(color.r).toBeCloseTo(1, 5)
            expect(color.g).toBe(0)
            expect(color.b).toBe(0)
        })


        test('creates color from another Color instance', () => {
            const original = new Color('#00ff00')
            const copy = new Color(original)
            expect(copy.r).toBe(original.r)
            expect(copy.g).toBe(original.g)
            expect(copy.b).toBe(original.b)
            expect(copy.a).toBe(original.a)
        })

    })


    describe('set', () => {

        test('sets from hex string with 6 characters', () => {
            const color = new Color()
            color.set('#ff8800')
            expect(color.r).toBeCloseTo(1, 5)
            expect(color.g).toBeCloseTo(0.533, 2)
            expect(color.b).toBe(0)
        })


        test('sets from hex string with 3 characters', () => {
            const color = new Color()
            color.set('#f00')
            expect(color.r).toBeCloseTo(1, 5)
            expect(color.g).toBe(0)
            expect(color.b).toBe(0)
        })


        test('sets from hex string with 8 characters (with alpha)', () => {
            const color = new Color()
            color.set('#ff000080')
            expect(color.r).toBeCloseTo(1, 5)
            expect(color.a).toBeCloseTo(0.502, 2)
        })


        test('sets from hex string with 4 characters (with alpha)', () => {
            const color = new Color()
            color.set('#f008')
            expect(color.r).toBeCloseTo(1, 5)
            expect(color.a).toBeCloseTo(0.533, 2)
        })


        test('sets from CSS color name', () => {
            const color = new Color()
            color.set('red')
            expect(color.r).toBeCloseTo(1, 5)
            expect(color.g).toBe(0)
            expect(color.b).toBe(0)
        })


        test('sets from rgb string', () => {
            const color = new Color()
            color.set('rgb(255, 128, 0)')
            expect(color.r).toBeCloseTo(1, 5)
            expect(color.g).toBeCloseTo(0.502, 2)
            expect(color.b).toBe(0)
        })


        test('sets from rgba string', () => {
            const color = new Color()
            color.set('rgba(255, 0, 0, 0.5)')
            expect(color.r).toBeCloseTo(1, 5)
            expect(color.a).toBe(0.5)
        })


        test('sets from hsl string', () => {
            const color = new Color()
            color.set('hsl(0, 100, 50)')
            expect(color.r).toBeCloseTo(1, 5)
            expect(color.g).toBeCloseTo(0, 1)
            expect(color.b).toBeCloseTo(0, 1)
        })


        test('sets from hsla string', () => {
            const color = new Color()
            color.set('hsla(0, 100, 50, 0.5)')
            expect(color.r).toBeCloseTo(1, 5)
            expect(color.a).toBe(0.5)
        })


        test('sets from number (RGB)', () => {
            const color = new Color()
            color.set(0xff0000)
            expect(color.r).toBeCloseTo(1, 5)
            expect(color.g).toBe(0)
            expect(color.b).toBe(0)
            expect(color.a).toBe(1)
        })


        test('sets from number (RGBA)', () => {
            const color = new Color()
            color.set(0xff000080)
            expect(color.r).toBeCloseTo(1, 5)
            expect(color.a).toBeCloseTo(0.502, 2)
        })


        test('sets from array', () => {
            const color = new Color()
            color.set([1, 0.5, 0.25, 0.75])
            expect(color.r).toBe(1)
            expect(color.g).toBe(0.5)
            expect(color.b).toBe(0.25)
            expect(color.a).toBe(0.75)
        })


        test('sets from array with missing alpha', () => {
            const color = new Color()
            color.set([1, 0.5, 0.25])
            expect(color.a).toBe(1)
        })


        test('sets from RGB object', () => {
            const color = new Color()
            color.set({r: 1, g: 0.5, b: 0.25})
            expect(color.r).toBe(1)
            expect(color.g).toBe(0.5)
            expect(color.b).toBe(0.25)
        })


        test('sets from HSL object', () => {
            const color = new Color()
            color.set({h: 0, s: 100, l: 50})
            expect(color.r).toBeCloseTo(1, 5)
            expect(color.g).toBeCloseTo(0, 1)
            expect(color.b).toBeCloseTo(0, 1)
        })


        test('returns this for chaining', () => {
            const color = new Color()
            const result = color.set('#ff0000')
            expect(result).toBe(color)
        })

    })


    describe('toHsl', () => {

        test('converts red to HSL', () => {
            const color = new Color('#ff0000')
            const hsl = color.toHsl()
            expect(hsl.h).toBe(0)
            expect(hsl.s).toBe(100)
            expect(hsl.l).toBe(50)
        })


        test('converts green to HSL', () => {
            const color = new Color('#00ff00')
            const hsl = color.toHsl()
            expect(hsl.h).toBe(120)
            expect(hsl.s).toBe(100)
            expect(hsl.l).toBe(50)
        })


        test('converts blue to HSL', () => {
            const color = new Color('#0000ff')
            const hsl = color.toHsl()
            expect(hsl.h).toBe(240)
            expect(hsl.s).toBe(100)
            expect(hsl.l).toBe(50)
        })


        test('converts gray to HSL', () => {
            const color = new Color('#808080')
            const hsl = color.toHsl()
            expect(hsl.h).toBe(0)
            expect(hsl.s).toBe(0)
            expect(hsl.l).toBe(50)
        })


        test('includes alpha in HSL output', () => {
            const color = new Color('#ff0000')
            color.a = 0.5
            const hsl = color.toHsl()
            expect(hsl.a).toBe(0.5)
        })

    })


    describe('toRgb', () => {

        test('returns RGB values 0-255', () => {
            const color = new Color('#ff8040')
            const rgb = color.toRgb()
            expect(rgb.r).toBe(255)
            expect(rgb.g).toBe(128)
            expect(rgb.b).toBe(64)
        })


        test('includes alpha', () => {
            const color = new Color('#ff0000')
            color.a = 0.5
            const rgb = color.toRgb()
            expect(rgb.a).toBe(0.5)
        })

    })


    describe('toHex', () => {

        test('returns hex string without alpha', () => {
            const color = new Color([1, 0.5, 0])
            const hex = color.toHex()
            expect(hex).toBe('#ff8000')
        })


        test('returns hex string with alpha when requested', () => {
            const color = new Color([1, 0, 0, 0.5])
            const hex = color.toHex(true)
            expect(hex).toBe('#ff000080')
        })

    })


    describe('toRgbString', () => {

        test('returns rgb() format for opaque colors', () => {
            const color = new Color('#ff8040')
            expect(color.toRgbString()).toBe('rgb(255, 128, 64)')
        })


        test('returns rgba() format for transparent colors', () => {
            const color = new Color('#ff8040')
            color.a = 0.5
            expect(color.toRgbString()).toBe('rgba(255, 128, 64, 0.5)')
        })

    })


    describe('toHslString', () => {

        test('returns hsl() format for opaque colors', () => {
            const color = new Color('#ff0000')
            expect(color.toHslString()).toBe('hsl(0, 100%, 50%)')
        })


        test('returns hsla() format for transparent colors', () => {
            const color = new Color('#ff0000')
            color.a = 0.5
            expect(color.toHslString()).toBe('hsla(0, 100%, 50%, 0.5)')
        })

    })


    test('toString returns hex string', () => {
        const color = new Color('#ff0000')
        expect(color.toString()).toBe('#ff0000')
    })


    test('clone creates independent copy', () => {
        const original = new Color('#ff0000')
        original.a = 0.5
        const cloned = original.clone()
        expect(cloned.r).toBe(original.r)
        expect(cloned.g).toBe(original.g)
        expect(cloned.b).toBe(original.b)
        expect(cloned.a).toBe(original.a)
        cloned.r = 0
        expect(original.r).toBeCloseTo(1, 5)
    })


    describe('copy', () => {

        test('copies values from another color', () => {
            const source = new Color('#00ff00')
            source.a = 0.5
            const target = new Color('#ff0000')
            target.copy(source)
            expect(target.r).toBe(source.r)
            expect(target.g).toBe(source.g)
            expect(target.b).toBe(source.b)
            expect(target.a).toBe(source.a)
        })


        test('returns this for chaining', () => {
            const source = new Color('#00ff00')
            const target = new Color()
            expect(target.copy(source)).toBe(target)
        })

    })


    describe('setAlpha', () => {

        test('sets alpha value', () => {
            const color = new Color('#ff0000')
            color.setAlpha(0.5)
            expect(color.a).toBe(0.5)
        })


        test('returns this for chaining', () => {
            const color = new Color()
            expect(color.setAlpha(0.5)).toBe(color)
        })

    })


    describe('lighten', () => {

        test('increases lightness', () => {
            const color = new Color('#ff0000')
            const originalL = color.toHsl().l
            color.lighten(20)
            expect(color.toHsl().l).toBeGreaterThan(originalL)
        })


        test('caps at 100%', () => {
            const color = new Color('#ffffff')
            color.lighten(50)
            expect(color.toHsl().l).toBe(100)
        })


        test('returns this for chaining', () => {
            const color = new Color('#ff0000')
            expect(color.lighten(10)).toBe(color)
        })

    })


    describe('darken', () => {

        test('decreases lightness', () => {
            const color = new Color('#ff0000')
            const originalL = color.toHsl().l
            color.darken(20)
            expect(color.toHsl().l).toBeLessThan(originalL)
        })


        test('caps at 0%', () => {
            const color = new Color('#000000')
            color.darken(50)
            expect(color.toHsl().l).toBe(0)
        })


        test('returns this for chaining', () => {
            const color = new Color('#ff0000')
            expect(color.darken(10)).toBe(color)
        })

    })


    describe('saturate', () => {

        test('increases saturation', () => {
            const color = new Color({h: 0, s: 50, l: 50})
            color.saturate(20)
            expect(color.toHsl().s).toBe(70)
        })


        test('caps at 100%', () => {
            const color = new Color('#ff0000')
            color.saturate(50)
            expect(color.toHsl().s).toBe(100)
        })


        test('returns this for chaining', () => {
            const color = new Color('#ff0000')
            expect(color.saturate(10)).toBe(color)
        })

    })


    describe('desaturate', () => {

        test('decreases saturation', () => {
            const color = new Color({h: 0, s: 50, l: 50})
            color.desaturate(20)
            expect(color.toHsl().s).toBe(30)
        })


        test('caps at 0%', () => {
            const color = new Color('#808080')
            color.desaturate(50)
            expect(color.toHsl().s).toBe(0)
        })


        test('returns this for chaining', () => {
            const color = new Color('#ff0000')
            expect(color.desaturate(10)).toBe(color)
        })

    })


    describe('rotate', () => {

        test('rotates hue by positive degrees', () => {
            const color = new Color('#ff0000')
            color.rotate(120)
            expect(color.toHsl().h).toBe(120)
        })


        test('rotates hue by negative degrees', () => {
            const color = new Color('#ff0000')
            color.rotate(-60)
            expect(color.toHsl().h).toBe(300)
        })


        test('wraps around 360', () => {
            const color = new Color({h: 350, s: 100, l: 50})
            color.rotate(30)
            expect(color.toHsl().h).toBe(20)
        })


        test('returns this for chaining', () => {
            const color = new Color('#ff0000')
            expect(color.rotate(90)).toBe(color)
        })

    })


    describe('mix', () => {

        test('mixes two colors equally by default', () => {
            const color = new Color('#ff0000')
            color.mix('#0000ff')
            expect(color.r).toBeCloseTo(0.5, 1)
            expect(color.b).toBeCloseTo(0.5, 1)
        })


        test('mixes with custom ratio', () => {
            const color = new Color('#ff0000')
            color.mix('#0000ff', 0.25)
            expect(color.r).toBeCloseTo(0.75, 1)
            expect(color.b).toBeCloseTo(0.25, 1)
        })


        test('accepts Color instance', () => {
            const color1 = new Color('#ff0000')
            const color2 = new Color('#0000ff')
            color1.mix(color2, 0.5)
            expect(color1.r).toBeCloseTo(0.5, 1)
            expect(color1.b).toBeCloseTo(0.5, 1)
        })


        test('returns this for chaining', () => {
            const color = new Color('#ff0000')
            expect(color.mix('#0000ff')).toBe(color)
        })

    })


    describe('invert', () => {

        test('inverts color', () => {
            const color = new Color('#ff0000')
            color.invert()
            expect(color.r).toBeCloseTo(0, 1)
            expect(color.g).toBeCloseTo(1, 1)
            expect(color.b).toBeCloseTo(1, 1)
        })


        test('returns this for chaining', () => {
            const color = new Color('#ff0000')
            expect(color.invert()).toBe(color)
        })

    })


    describe('grayscale', () => {

        test('converts to grayscale using luminance weights', () => {
            const color = new Color('#ff0000')
            color.grayscale()
            expect(color.r).toBe(color.g)
            expect(color.g).toBe(color.b)
        })


        test('returns this for chaining', () => {
            const color = new Color('#ff0000')
            expect(color.grayscale()).toBe(color)
        })

    })


    describe('equals', () => {

        test('returns true for identical colors', () => {
            const color1 = new Color('#ff0000')
            const color2 = new Color('#ff0000')
            expect(color1.equals(color2)).toBe(true)
        })


        test('returns false for different colors', () => {
            const color1 = new Color('#ff0000')
            const color2 = new Color('#00ff00')
            expect(color1.equals(color2)).toBe(false)
        })


        test('compares with non-Color values', () => {
            const color = new Color('#ff0000')
            expect(color.equals('#ff0000')).toBe(true)
            expect(color.equals('#00ff00')).toBe(false)
        })


        test('considers alpha in comparison', () => {
            const color1 = new Color('#ff0000')
            const color2 = new Color('#ff0000')
            color2.a = 0.5
            expect(color1.equals(color2)).toBe(false)
        })

    })


    describe('luminance', () => {

        test('returns 0 for black', () => {
            const color = new Color('#000000')
            expect(color.luminance).toBe(0)
        })


        test('returns 1 for white', () => {
            const color = new Color('#ffffff')
            expect(color.luminance).toBeCloseTo(1, 2)
        })


        test('returns value between 0 and 1 for other colors', () => {
            const color = new Color('#808080')
            expect(color.luminance).toBeGreaterThan(0)
            expect(color.luminance).toBeLessThan(1)
        })

    })


    describe('isDark', () => {

        test('returns true for dark colors', () => {
            const color = new Color('#000000')
            expect(color.isDark).toBe(true)
        })


        test('returns false for light colors', () => {
            const color = new Color('#ffffff')
            expect(color.isDark).toBe(false)
        })

    })


    describe('isLight', () => {

        test('returns true for light colors', () => {
            const color = new Color('#ffffff')
            expect(color.isLight).toBe(true)
        })


        test('returns false for dark colors', () => {
            const color = new Color('#000000')
            expect(color.isLight).toBe(false)
        })

    })

})
