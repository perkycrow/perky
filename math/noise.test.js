import Noise from './noise.js'


describe(Noise, () => {
    let noise

    beforeEach(() => {
        noise = new Noise(12345)
    })


    describe('constructor', () => {

        test('creates instance with default seed', () => {
            const defaultNoise = new Noise()
            expect(defaultNoise).toBeInstanceOf(Noise)
        })


        test('creates instance with custom seed', () => {
            const customNoise = new Noise(42)
            expect(customNoise).toBeInstanceOf(Noise)
        })

    })


    describe('seed', () => {

        test('returns this for chaining', () => {
            expect(noise.seed(999)).toBe(noise)
        })


        test('resets generator with new seed', () => {
            const value1 = noise.perlin(1, 2, 3)
            noise.seed(12345)
            const value2 = noise.perlin(1, 2, 3)
            expect(value1).toBe(value2)
        })


        test('different seeds produce different values', () => {
            const noise1 = new Noise(111)
            const noise2 = new Noise(222)
            expect(noise1.perlin(1.7, 2.3, 3.9)).not.toBe(noise2.perlin(1.7, 2.3, 3.9))
        })

    })


    describe('perlin', () => {

        test('returns value between -1 and 1', () => {
            for (let i = 0; i < 100; i++) {
                const value = noise.perlin(i * 0.1, i * 0.2, i * 0.3)
                expect(value).toBeGreaterThanOrEqual(-1)
                expect(value).toBeLessThanOrEqual(1)
            }
        })


        test('deterministic for same inputs', () => {
            const value1 = noise.perlin(1.5, 2.5, 3.5)
            const value2 = noise.perlin(1.5, 2.5, 3.5)
            expect(value1).toBe(value2)
        })


        test('varies smoothly between adjacent points', () => {
            const value1 = noise.perlin(1.0, 1.0, 1.0)
            const value2 = noise.perlin(1.01, 1.0, 1.0)
            expect(Math.abs(value1 - value2)).toBeLessThan(0.1)
        })


        test('works with default y and z parameters', () => {
            const value = noise.perlin(5)
            expect(typeof value).toBe('number')
            expect(value).not.toBeNaN()
        })

    })


    describe('perlin2d', () => {

        test('returns same value as perlin with z=0', () => {
            const value2d = noise.perlin2d(1.5, 2.5)
            const value3d = noise.perlin(1.5, 2.5, 0)
            expect(value2d).toBe(value3d)
        })


        test('returns value between -1 and 1', () => {
            for (let i = 0; i < 100; i++) {
                const value = noise.perlin2d(i * 0.1, i * 0.2)
                expect(value).toBeGreaterThanOrEqual(-1)
                expect(value).toBeLessThanOrEqual(1)
            }
        })

    })


    describe('fbm', () => {

        test('returns value between -1 and 1', () => {
            for (let i = 0; i < 50; i++) {
                const value = noise.fbm(i * 0.1, i * 0.2)
                expect(value).toBeGreaterThanOrEqual(-1)
                expect(value).toBeLessThanOrEqual(1)
            }
        })


        test('uses default options', () => {
            const value = noise.fbm(1, 2)
            expect(typeof value).toBe('number')
            expect(value).not.toBeNaN()
        })


        test('respects octaves parameter', () => {
            const value1 = noise.fbm(1.5, 2.7, {octaves: 1})
            const value2 = noise.fbm(1.5, 2.7, {octaves: 8})
            expect(value1).not.toBe(value2)
        })


        test('respects lacunarity parameter', () => {
            const value1 = noise.fbm(1, 2, {lacunarity: 1.5})
            const value2 = noise.fbm(1, 2, {lacunarity: 3})
            expect(value1).not.toBe(value2)
        })


        test('respects persistence parameter', () => {
            const value1 = noise.fbm(1.5, 2.7, {persistence: 0.3})
            const value2 = noise.fbm(1.5, 2.7, {persistence: 0.7})
            expect(value1).not.toBe(value2)
        })


        test('deterministic for same inputs', () => {
            const value1 = noise.fbm(5, 10, {octaves: 4, lacunarity: 2, persistence: 0.5})
            const value2 = noise.fbm(5, 10, {octaves: 4, lacunarity: 2, persistence: 0.5})
            expect(value1).toBe(value2)
        })

    })

})
