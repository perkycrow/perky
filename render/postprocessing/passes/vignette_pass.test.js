import {describe, test, expect} from 'vitest'
import VignettePass from './vignette_pass.js'
import RenderPass from '../render_pass.js'


describe(VignettePass, () => {

    test('extends RenderPass', () => {
        const pass = new VignettePass()
        expect(pass).toBeInstanceOf(RenderPass)
    })


    test('shaderDefinition', () => {
        expect(VignettePass.shaderDefinition).toBeDefined()
        expect(VignettePass.shaderDefinition.vertex).toContain('aPosition')
        expect(VignettePass.shaderDefinition.vertex).toContain('aTexCoord')
        expect(VignettePass.shaderDefinition.fragment).toContain('uTexture')
        expect(VignettePass.shaderDefinition.fragment).toContain('uIntensity')
        expect(VignettePass.shaderDefinition.fragment).toContain('uSmoothness')
        expect(VignettePass.shaderDefinition.fragment).toContain('uRoundness')
        expect(VignettePass.shaderDefinition.fragment).toContain('uColor')
    })


    test('shaderDefinition uniforms', () => {
        expect(VignettePass.shaderDefinition.uniforms).toContain('uTexture')
        expect(VignettePass.shaderDefinition.uniforms).toContain('uIntensity')
        expect(VignettePass.shaderDefinition.uniforms).toContain('uSmoothness')
        expect(VignettePass.shaderDefinition.uniforms).toContain('uRoundness')
        expect(VignettePass.shaderDefinition.uniforms).toContain('uColor')
    })


    test('shaderDefinition attributes', () => {
        expect(VignettePass.shaderDefinition.attributes).toContain('aPosition')
        expect(VignettePass.shaderDefinition.attributes).toContain('aTexCoord')
    })


    test('defaultUniforms', () => {
        expect(VignettePass.defaultUniforms.uIntensity).toBe(0.4)
        expect(VignettePass.defaultUniforms.uSmoothness).toBe(0.8)
        expect(VignettePass.defaultUniforms.uRoundness).toBe(0.5)
        expect(VignettePass.defaultUniforms.uColor).toEqual([0.0, 0.0, 0.0])
    })


    test('uniformConfig', () => {
        expect(VignettePass.uniformConfig.uIntensity).toEqual({min: 0, max: 1, step: 0.01})
        expect(VignettePass.uniformConfig.uSmoothness).toEqual({min: 0, max: 2, step: 0.01})
        expect(VignettePass.uniformConfig.uRoundness).toEqual({min: 0, max: 1, step: 0.01})
        expect(VignettePass.uniformConfig.uColor).toEqual({type: 'color'})
    })


    test('inherits default uniforms in instance', () => {
        const pass = new VignettePass()
        expect(pass.uniforms.uIntensity).toBe(0.4)
        expect(pass.uniforms.uSmoothness).toBe(0.8)
        expect(pass.uniforms.uRoundness).toBe(0.5)
        expect(pass.uniforms.uColor).toEqual([0.0, 0.0, 0.0])
    })


    test('setUniform', () => {
        const pass = new VignettePass()
        pass.setUniform('uIntensity', 0.6)
        pass.setUniform('uSmoothness', 1.0)
        pass.setUniform('uRoundness', 0.8)
        pass.setUniform('uColor', [1.0, 0.0, 0.0])

        expect(pass.uniforms.uIntensity).toBe(0.6)
        expect(pass.uniforms.uSmoothness).toBe(1.0)
        expect(pass.uniforms.uRoundness).toBe(0.8)
        expect(pass.uniforms.uColor).toEqual([1.0, 0.0, 0.0])
    })

})
