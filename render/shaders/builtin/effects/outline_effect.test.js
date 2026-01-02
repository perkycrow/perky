import {describe, test, expect} from 'vitest'
import OutlineEffect from './outline_effect.js'
import ShaderEffect from '../../shader_effect.js'


describe('OutlineEffect', () => {

    test('extends ShaderEffect', () => {
        const effect = new OutlineEffect()
        expect(effect).toBeInstanceOf(ShaderEffect)
    })


    describe('static shader', () => {

        test('has width param', () => {
            expect(OutlineEffect.shader.params).toContain('width')
        })


        test('has fragment code', () => {
            expect(OutlineEffect.shader.fragment).toContain('neighborAlpha')
            expect(OutlineEffect.shader.fragment).toContain('texelSize')
        })

    })


    describe('constructor', () => {

        test('creates with default width', () => {
            const effect = new OutlineEffect()
            expect(effect.width).toBe(0.02)
        })


        test('creates with custom width', () => {
            const effect = new OutlineEffect({width: 0.05})
            expect(effect.width).toBe(0.05)
        })


        test('creates with enabled from options', () => {
            const effect = new OutlineEffect({enabled: false})
            expect(effect.enabled).toBe(false)
        })

    })


    test('getParams returns width value', () => {
        const effect = new OutlineEffect({width: 0.03})
        expect(effect.getParams()).toEqual([0.03])
    })


    test('type returns class name', () => {
        const effect = new OutlineEffect()
        expect(effect.type).toBe('OutlineEffect')
    })

})
