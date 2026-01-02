import {describe, test, expect} from 'vitest'
import OutlineEffect from './outline_effect.js'
import SpriteEffect from './sprite_effect.js'


describe('OutlineEffect', () => {

    test('extends SpriteEffect', () => {
        const effect = new OutlineEffect()
        expect(effect).toBeInstanceOf(SpriteEffect)
    })


    test('has outline type', () => {
        expect(OutlineEffect.type).toBe('outline')
        expect(new OutlineEffect().type).toBe('outline')
    })


    describe('constructor', () => {

        test('creates with default values', () => {
            const effect = new OutlineEffect()

            expect(effect.width).toBe(0.02)
            expect(effect.color).toEqual([1, 1, 1, 1])
        })


        test('creates with provided options', () => {
            const effect = new OutlineEffect({
                width: 0.05,
                color: [1, 0, 0, 1]
            })

            expect(effect.width).toBe(0.05)
            expect(effect.color).toEqual([1, 0, 0, 1])
        })

    })


    test('width can be set', () => {
        const effect = new OutlineEffect()
        effect.width = 0.1
        expect(effect.width).toBe(0.1)
    })


    test('color can be set', () => {
        const effect = new OutlineEffect()
        effect.color = [0, 1, 0, 1]
        expect(effect.color).toEqual([0, 1, 0, 1])
    })


    test('getHints returns width and color', () => {
        const effect = new OutlineEffect({
            width: 0.03,
            color: [0, 0, 1, 1]
        })

        expect(effect.getHints()).toEqual({
            width: 0.03,
            color: [0, 0, 1, 1]
        })
    })

})
