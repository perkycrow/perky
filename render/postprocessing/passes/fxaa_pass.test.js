import {describe, test, expect} from 'vitest'
import FxaaPass from './fxaa_pass.js'
import RenderPass from '../render_pass.js'


describe(FxaaPass, () => {

    test('extends RenderPass', () => {
        const pass = new FxaaPass()
        expect(pass).toBeInstanceOf(RenderPass)
    })


    test('$name', () => {
        expect(FxaaPass.$name).toBe('fxaaPass')
    })


    test('shaderDefinition', () => {
        expect(FxaaPass.shaderDefinition).toBeDefined()
        expect(FxaaPass.shaderDefinition.vertex).toContain('aPosition')
        expect(FxaaPass.shaderDefinition.vertex).toContain('aTexCoord')
        expect(FxaaPass.shaderDefinition.fragment).toContain('uTexture')
        expect(FxaaPass.shaderDefinition.fragment).toContain('uInverseResolution')
        expect(FxaaPass.shaderDefinition.fragment).toContain('uEdgeThreshold')
        expect(FxaaPass.shaderDefinition.fragment).toContain('uEdgeThresholdMin')
    })


    test('shader detects edges with luminance', () => {
        expect(FxaaPass.shaderDefinition.fragment).toContain('luminance')
        expect(FxaaPass.shaderDefinition.fragment).toContain('0.299')
    })


    test('shader walks along edge', () => {
        expect(FxaaPass.shaderDefinition.fragment).toContain('for (int i = 0; i < 12; i++)')
    })


    test('shader handles horizontal and vertical edges', () => {
        expect(FxaaPass.shaderDefinition.fragment).toContain('isHorizontal')
        expect(FxaaPass.shaderDefinition.fragment).toContain('edgeH')
        expect(FxaaPass.shaderDefinition.fragment).toContain('edgeV')
    })


    test('shader has sub-pixel anti-aliasing', () => {
        expect(FxaaPass.shaderDefinition.fragment).toContain('subPixelOffset')
    })


    test('shaderDefinition uniforms', () => {
        expect(FxaaPass.shaderDefinition.uniforms).toContain('uTexture')
        expect(FxaaPass.shaderDefinition.uniforms).toContain('uInverseResolution')
        expect(FxaaPass.shaderDefinition.uniforms).toContain('uEdgeThreshold')
        expect(FxaaPass.shaderDefinition.uniforms).toContain('uEdgeThresholdMin')
    })


    test('shaderDefinition attributes', () => {
        expect(FxaaPass.shaderDefinition.attributes).toContain('aPosition')
        expect(FxaaPass.shaderDefinition.attributes).toContain('aTexCoord')
    })


    test('defaultUniforms', () => {
        expect(FxaaPass.defaultUniforms.uEdgeThreshold).toBe(0.125)
        expect(FxaaPass.defaultUniforms.uEdgeThresholdMin).toBe(0.0312)
        expect(FxaaPass.defaultUniforms.uInverseResolution).toEqual([1 / 1920, 1 / 1080])
    })


    test('uniformConfig', () => {
        expect(FxaaPass.uniformConfig.uEdgeThreshold).toEqual({min: 0.063, max: 0.333, step: 0.001})
        expect(FxaaPass.uniformConfig.uEdgeThresholdMin).toEqual({min: 0.0, max: 0.1, step: 0.001})
    })


    test('inherits default uniforms in instance', () => {
        const pass = new FxaaPass()
        expect(pass.uniforms.uEdgeThreshold).toBe(0.125)
        expect(pass.uniforms.uEdgeThresholdMin).toBe(0.0312)
    })


    test('setUniform', () => {
        const pass = new FxaaPass()
        pass.setUniform('uEdgeThreshold', 0.2)
        expect(pass.uniforms.uEdgeThreshold).toBe(0.2)
    })

})
