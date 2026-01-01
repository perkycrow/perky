import {describe, test, expect} from 'vitest'
import ColorGradePass from './color_grade_pass.js'
import RenderPass from '../render_pass.js'


describe(ColorGradePass, () => {

    test('extends RenderPass', () => {
        const pass = new ColorGradePass()
        expect(pass).toBeInstanceOf(RenderPass)
    })


    test('shaderDefinition', () => {
        expect(ColorGradePass.shaderDefinition).toBeDefined()
        expect(ColorGradePass.shaderDefinition.vertex).toContain('aPosition')
        expect(ColorGradePass.shaderDefinition.vertex).toContain('aTexCoord')
        expect(ColorGradePass.shaderDefinition.fragment).toContain('uTexture')
        expect(ColorGradePass.shaderDefinition.fragment).toContain('uBrightness')
        expect(ColorGradePass.shaderDefinition.fragment).toContain('uContrast')
        expect(ColorGradePass.shaderDefinition.fragment).toContain('uSaturation')
    })


    test('shaderDefinition uniforms', () => {
        expect(ColorGradePass.shaderDefinition.uniforms).toContain('uTexture')
        expect(ColorGradePass.shaderDefinition.uniforms).toContain('uBrightness')
        expect(ColorGradePass.shaderDefinition.uniforms).toContain('uContrast')
        expect(ColorGradePass.shaderDefinition.uniforms).toContain('uSaturation')
    })


    test('shaderDefinition attributes', () => {
        expect(ColorGradePass.shaderDefinition.attributes).toContain('aPosition')
        expect(ColorGradePass.shaderDefinition.attributes).toContain('aTexCoord')
    })


    test('defaultUniforms', () => {
        expect(ColorGradePass.defaultUniforms.uBrightness).toBe(0.0)
        expect(ColorGradePass.defaultUniforms.uContrast).toBe(1.0)
        expect(ColorGradePass.defaultUniforms.uSaturation).toBe(1.0)
    })


    test('uniformConfig', () => {
        expect(ColorGradePass.uniformConfig.uBrightness).toEqual({min: -0.5, max: 0.5, step: 0.01})
        expect(ColorGradePass.uniformConfig.uContrast).toEqual({min: 0.5, max: 1.5, step: 0.01})
        expect(ColorGradePass.uniformConfig.uSaturation).toEqual({min: 0, max: 2, step: 0.01})
    })


    test('inherits default uniforms in instance', () => {
        const pass = new ColorGradePass()
        expect(pass.uniforms.uBrightness).toBe(0.0)
        expect(pass.uniforms.uContrast).toBe(1.0)
        expect(pass.uniforms.uSaturation).toBe(1.0)
    })


    test('setUniform', () => {
        const pass = new ColorGradePass()
        pass.setUniform('uBrightness', 0.2)
        pass.setUniform('uContrast', 1.2)
        pass.setUniform('uSaturation', 1.5)

        expect(pass.uniforms.uBrightness).toBe(0.2)
        expect(pass.uniforms.uContrast).toBe(1.2)
        expect(pass.uniforms.uSaturation).toBe(1.5)
    })

})
