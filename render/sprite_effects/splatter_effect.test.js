import {describe, test, expect} from 'vitest'
import SplatterEffect from './splatter_effect.js'
import SpriteEffect from './sprite_effect.js'


describe('SplatterEffect', () => {

    test('extends SpriteEffect', () => {
        const effect = new SplatterEffect()
        expect(effect).toBeInstanceOf(SpriteEffect)
    })


    test('has splatter type', () => {
        expect(SplatterEffect.type).toBe('splatter')
        expect(new SplatterEffect().type).toBe('splatter')
    })


    describe('constructor', () => {

        test('creates with default values', () => {
            const effect = new SplatterEffect()

            expect(effect.intensity).toBe(0)
            expect(effect.pattern).toBe(0)
            expect(effect.atlas).toBe(null)
        })


        test('creates with provided options', () => {
            const mockAtlas = {name: 'blood'}
            const effect = new SplatterEffect({
                intensity: 0.5,
                pattern: 3,
                atlas: mockAtlas
            })

            expect(effect.intensity).toBe(0.5)
            expect(effect.pattern).toBe(3)
            expect(effect.atlas).toBe(mockAtlas)
        })

    })


    describe('intensity', () => {

        test('can be set', () => {
            const effect = new SplatterEffect()
            effect.intensity = 0.7
            expect(effect.intensity).toBe(0.7)
        })


        test('is clamped to 0-1', () => {
            const effect = new SplatterEffect()

            effect.intensity = -0.5
            expect(effect.intensity).toBe(0)

            effect.intensity = 1.5
            expect(effect.intensity).toBe(1)
        })

    })


    test('pattern can be set', () => {
        const effect = new SplatterEffect()
        effect.pattern = 5
        expect(effect.pattern).toBe(5)
    })


    test('atlas can be set', () => {
        const mockAtlas = {name: 'dirt'}
        const effect = new SplatterEffect()
        effect.atlas = mockAtlas
        expect(effect.atlas).toBe(mockAtlas)
    })


    test('getHints returns intensity, pattern and atlas', () => {
        const mockAtlas = {name: 'blood'}
        const effect = new SplatterEffect({
            intensity: 0.8,
            pattern: 2,
            atlas: mockAtlas
        })

        expect(effect.getHints()).toEqual({
            intensity: 0.8,
            pattern: 2,
            atlas: mockAtlas
        })
    })

})
