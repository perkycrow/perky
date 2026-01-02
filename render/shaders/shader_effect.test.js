import {describe, test, expect} from 'vitest'
import ShaderEffect from './shader_effect.js'


describe('ShaderEffect', () => {

    describe('static shader', () => {

        test('has empty params by default', () => {
            expect(ShaderEffect.shader.params).toEqual([])
        })


        test('has empty uniforms by default', () => {
            expect(ShaderEffect.shader.uniforms).toEqual([])
        })


        test('has empty fragment by default', () => {
            expect(ShaderEffect.shader.fragment).toBe('')
        })

    })


    describe('constructor', () => {

        test('creates with enabled true by default', () => {
            const effect = new ShaderEffect()
            expect(effect.enabled).toBe(true)
        })


        test('creates with enabled from options', () => {
            const effect = new ShaderEffect({enabled: false})
            expect(effect.enabled).toBe(false)
        })

    })


    describe('enabled', () => {

        test('can be set', () => {
            const effect = new ShaderEffect()
            effect.enabled = false
            expect(effect.enabled).toBe(false)
        })

    })


    describe('type getter', () => {

        test('returns constructor name', () => {
            const effect = new ShaderEffect()
            expect(effect.type).toBe('ShaderEffect')
        })


        test('returns subclass name', () => {
            class ChromaticEffect extends ShaderEffect {}
            const effect = new ChromaticEffect()
            expect(effect.type).toBe('ChromaticEffect')
        })

    })


    describe('getParams', () => {

        test('returns empty array for base class', () => {
            const effect = new ShaderEffect()
            expect(effect.getParams()).toEqual([])
        })


        test('returns param values for subclass', () => {
            class IntensityEffect extends ShaderEffect {
                static shader = {
                    params: ['intensity', 'strength'],
                    uniforms: [],
                    fragment: ''
                }

                intensity = 0.5
                strength = 1.0
            }

            const effect = new IntensityEffect()
            expect(effect.getParams()).toEqual([0.5, 1.0])
        })


        test('returns 0 for undefined params', () => {
            class PartialEffect extends ShaderEffect {
                static shader = {
                    params: ['defined', 'undefined'],
                    uniforms: [],
                    fragment: ''
                }

                defined = 0.8
            }

            const effect = new PartialEffect()
            expect(effect.getParams()).toEqual([0.8, 0])
        })

    })


    describe('getHints', () => {

        test('returns null', () => {
            const effect = new ShaderEffect()
            expect(effect.getHints()).toBe(null)
        })

    })


    describe('update', () => {

        test('exists and can be called', () => {
            const effect = new ShaderEffect()
            expect(() => effect.update(16)).not.toThrow()
        })

    })


    describe('dispose', () => {

        test('exists and can be called', () => {
            const effect = new ShaderEffect()
            expect(() => effect.dispose()).not.toThrow()
        })

    })

})
