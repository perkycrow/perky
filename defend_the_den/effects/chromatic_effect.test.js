import {describe, test, expect} from 'vitest'
import ChromaticEffect from './chromatic_effect.js'
import ShaderEffect from '../../render/shaders/shader_effect.js'


describe('ChromaticEffect', () => {

    describe('inheritance', () => {

        test('extends ShaderEffect', () => {
            const effect = new ChromaticEffect()
            expect(effect).toBeInstanceOf(ShaderEffect)
        })

    })


    describe('static shader', () => {

        test('has intensity param', () => {
            expect(ChromaticEffect.shader.params).toContain('intensity')
        })


        test('has fragment code with chromatic aberration', () => {
            expect(ChromaticEffect.shader.fragment).toContain('offset')
            expect(ChromaticEffect.shader.fragment).toContain('color.r')
            expect(ChromaticEffect.shader.fragment).toContain('color.b')
        })

    })


    describe('constructor', () => {

        test('creates with default intensity', () => {
            const effect = new ChromaticEffect()
            expect(effect.intensity).toBe(0.5)
        })


        test('creates with custom intensity', () => {
            const effect = new ChromaticEffect({intensity: 0.8})
            expect(effect.intensity).toBe(0.8)
        })


        test('creates with enabled from options', () => {
            const effect = new ChromaticEffect({enabled: false})
            expect(effect.enabled).toBe(false)
        })

    })


    describe('getParams', () => {

        test('returns intensity value', () => {
            const effect = new ChromaticEffect({intensity: 0.3})
            expect(effect.getParams()).toEqual([0.3])
        })

    })


    describe('type', () => {

        test('returns class name', () => {
            const effect = new ChromaticEffect()
            expect(effect.type).toBe('ChromaticEffect')
        })

    })

})
