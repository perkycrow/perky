import Easing from './easing.js'


describe('Easing', () => {

    describe('linear', () => {

        test('returns 0 at t=0', () => {
            expect(Easing.linear(0)).toBe(0)
        })

        test('returns 1 at t=1', () => {
            expect(Easing.linear(1)).toBe(1)
        })

        test('returns 0.5 at t=0.5', () => {
            expect(Easing.linear(0.5)).toBe(0.5)
        })

        test('returns input unchanged', () => {
            expect(Easing.linear(0.25)).toBe(0.25)
            expect(Easing.linear(0.75)).toBe(0.75)
        })

    })


    describe('resolve', () => {

        test('returns function as-is', () => {
            const customFn = t => t * t
            expect(Easing.resolve(customFn)).toBe(customFn)
        })

        test('returns easing function by name', () => {
            expect(Easing.resolve('linear')).toBe(Easing.linear)
            expect(Easing.resolve('easeInQuad')).toBe(Easing.easeInQuad)
            expect(Easing.resolve('easeOutCubic')).toBe(Easing.easeOutCubic)
        })

        test('returns linear for unknown string', () => {
            expect(Easing.resolve('unknownEasing')).toBe(Easing.linear)
        })

        test('returns linear for invalid input', () => {
            expect(Easing.resolve(null)).toBe(Easing.linear)
            expect(Easing.resolve(undefined)).toBe(Easing.linear)
            expect(Easing.resolve(123)).toBe(Easing.linear)
        })

    })


    describe('lerp', () => {

        test('returns start at t=0', () => {
            expect(Easing.lerp(10, 20, 0)).toBe(10)
        })

        test('returns end at t=1', () => {
            expect(Easing.lerp(10, 20, 1)).toBe(20)
        })

        test('returns midpoint at t=0.5 with linear', () => {
            expect(Easing.lerp(0, 100, 0.5)).toBe(50)
        })

        test('interpolates correctly', () => {
            expect(Easing.lerp(0, 100, 0.25)).toBe(25)
            expect(Easing.lerp(0, 100, 0.75)).toBe(75)
        })

        test('works with negative values', () => {
            expect(Easing.lerp(-100, 100, 0.5)).toBe(0)
            expect(Easing.lerp(100, -100, 0.5)).toBe(0)
        })

        test('uses linear easing by default', () => {
            expect(Easing.lerp(0, 100, 0.5)).toBe(50)
        })

        test('accepts easing function by name', () => {
            const result = Easing.lerp(0, 100, 0.5, 'easeInQuad')
            expect(result).toBe(25) // easeInQuad(0.5) = 0.25
        })

        test('accepts custom easing function', () => {
            const customEase = t => t * t * t // cubic
            const result = Easing.lerp(0, 100, 0.5, customEase)
            expect(result).toBe(12.5) // 0.5^3 = 0.125
        })

    })

})
