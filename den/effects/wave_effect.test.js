import {describe, test, expect} from 'vitest'
import WaveEffect from './wave_effect.js'
import ShaderEffect from '../../render/shaders/shader_effect.js'


describe('WaveEffect', () => {

    test('extends ShaderEffect', () => {
        const effect = new WaveEffect()
        expect(effect).toBeInstanceOf(ShaderEffect)
    })


    describe('static shader', () => {

        test('has amplitude and phase params', () => {
            expect(WaveEffect.shader.params).toContain('amplitude')
            expect(WaveEffect.shader.params).toContain('phase')
        })


        test('has no extra uniforms', () => {
            expect(WaveEffect.shader.uniforms).toBeUndefined()
        })


        test('has fragment code with wave distortion', () => {
            expect(WaveEffect.shader.fragment).toContain('sin')
            expect(WaveEffect.shader.fragment).toContain('phase')
            expect(WaveEffect.shader.fragment).toContain('distorted')
        })

    })


    describe('constructor', () => {

        test('creates with default amplitude', () => {
            const effect = new WaveEffect()
            expect(effect.amplitude).toBe(0.5)
        })


        test('creates with default phase', () => {
            const effect = new WaveEffect()
            expect(effect.phase).toBe(0)
        })


        test('creates with custom amplitude', () => {
            const effect = new WaveEffect({amplitude: 0.8})
            expect(effect.amplitude).toBe(0.8)
        })


        test('creates with custom phase', () => {
            const effect = new WaveEffect({phase: 2.0})
            expect(effect.phase).toBe(2.0)
        })

    })


    test('getParams returns amplitude and phase values', () => {
        const effect = new WaveEffect({amplitude: 0.3, phase: 1.5})
        expect(effect.getParams()).toEqual([0.3, 1.5])
    })


    test('type returns class name', () => {
        const effect = new WaveEffect()
        expect(effect.type).toBe('WaveEffect')
    })

})
