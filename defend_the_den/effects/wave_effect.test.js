import {describe, test, expect} from 'vitest'
import WaveEffect from './wave_effect.js'
import ShaderEffect from '../../render/shaders/shader_effect.js'


describe('WaveEffect', () => {

    describe('inheritance', () => {

        test('extends ShaderEffect', () => {
            const effect = new WaveEffect()
            expect(effect).toBeInstanceOf(ShaderEffect)
        })

    })


    describe('static shader', () => {

        test('has amplitude and frequency params', () => {
            expect(WaveEffect.shader.params).toContain('amplitude')
            expect(WaveEffect.shader.params).toContain('frequency')
        })


        test('has uTime uniform', () => {
            expect(WaveEffect.shader.uniforms).toContain('uTime')
        })


        test('has fragment code with wave distortion', () => {
            expect(WaveEffect.shader.fragment).toContain('sin')
            expect(WaveEffect.shader.fragment).toContain('uTime')
            expect(WaveEffect.shader.fragment).toContain('distorted')
        })

    })


    describe('constructor', () => {

        test('creates with default amplitude', () => {
            const effect = new WaveEffect()
            expect(effect.amplitude).toBe(0.5)
        })


        test('creates with default frequency', () => {
            const effect = new WaveEffect()
            expect(effect.frequency).toBe(1.0)
        })


        test('creates with custom amplitude', () => {
            const effect = new WaveEffect({amplitude: 0.8})
            expect(effect.amplitude).toBe(0.8)
        })


        test('creates with custom frequency', () => {
            const effect = new WaveEffect({frequency: 2.0})
            expect(effect.frequency).toBe(2.0)
        })

    })


    describe('getParams', () => {

        test('returns amplitude and frequency values', () => {
            const effect = new WaveEffect({amplitude: 0.3, frequency: 1.5})
            expect(effect.getParams()).toEqual([0.3, 1.5])
        })

    })


    describe('type', () => {

        test('returns class name', () => {
            const effect = new WaveEffect()
            expect(effect.type).toBe('WaveEffect')
        })

    })

})
