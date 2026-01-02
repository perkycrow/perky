import {describe, test, expect} from 'vitest'
import SpriteEffect from './sprite_effect.js'


describe('SpriteEffect', () => {

    describe('static type', () => {

        test('has base type', () => {
            expect(SpriteEffect.type).toBe('base')
        })

    })


    describe('constructor', () => {

        test('creates with enabled true by default', () => {
            const effect = new SpriteEffect()
            expect(effect.enabled).toBe(true)
        })


        test('creates with enabled from options', () => {
            const effect = new SpriteEffect({enabled: false})
            expect(effect.enabled).toBe(false)
        })

    })


    describe('enabled', () => {

        test('can be set', () => {
            const effect = new SpriteEffect()
            effect.enabled = false
            expect(effect.enabled).toBe(false)
        })

    })


    describe('type getter', () => {

        test('returns constructor type', () => {
            const effect = new SpriteEffect()
            expect(effect.type).toBe('base')
        })


        test('returns subclass type', () => {
            class CustomEffect extends SpriteEffect {
                static type = 'custom'
            }

            const effect = new CustomEffect()
            expect(effect.type).toBe('custom')
        })

    })


    describe('getHints', () => {

        test('returns null by default', () => {
            const effect = new SpriteEffect()
            expect(effect.getHints()).toBe(null)
        })

    })


    describe('update', () => {

        test('exists and accepts deltaTime', () => {
            const effect = new SpriteEffect()
            expect(() => effect.update(16)).not.toThrow()
        })

    })


    describe('dispose', () => {

        test('exists and can be called', () => {
            const effect = new SpriteEffect()
            expect(() => effect.dispose()).not.toThrow()
        })

    })

})
