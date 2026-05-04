import {describe, test, expect} from 'vitest'
import {
    SSAO_VERTEX,
    SSAO_FRAGMENT,
    SSAO_BLUR_VERTEX,
    SSAO_BLUR_FRAGMENT,
    SSAO_SHADER_DEF,
    SSAO_BLUR_SHADER_DEF
} from './ssao_shader.js'


describe('SSAO_VERTEX', () => {

    test('is a string', () => {
        expect(typeof SSAO_VERTEX).toBe('string')
    })


    test('contains version directive', () => {
        expect(SSAO_VERTEX).toContain('#version 300 es')
    })


    test('declares aPosition attribute', () => {
        expect(SSAO_VERTEX).toContain('in vec2 aPosition')
    })


    test('declares aTexCoord attribute', () => {
        expect(SSAO_VERTEX).toContain('in vec2 aTexCoord')
    })

})


describe('SSAO_FRAGMENT', () => {

    test('is a string', () => {
        expect(typeof SSAO_FRAGMENT).toBe('string')
    })


    test('contains version directive', () => {
        expect(SSAO_FRAGMENT).toContain('#version 300 es')
    })


    test('declares uDepth uniform', () => {
        expect(SSAO_FRAGMENT).toContain('uniform highp sampler2D uDepth')
    })


    test('declares uGNormal uniform', () => {
        expect(SSAO_FRAGMENT).toContain('uniform sampler2D uGNormal')
    })


    test('declares matrix uniforms', () => {
        expect(SSAO_FRAGMENT).toContain('uniform mat4 uProjection')
        expect(SSAO_FRAGMENT).toContain('uniform mat4 uInverseViewProjection')
        expect(SSAO_FRAGMENT).toContain('uniform mat4 uView')
    })


    test('declares ssao parameters', () => {
        expect(SSAO_FRAGMENT).toContain('uniform float uRadius')
        expect(SSAO_FRAGMENT).toContain('uniform float uBias')
        expect(SSAO_FRAGMENT).toContain('uniform float uIntensity')
    })


    test('declares fragColor output', () => {
        expect(SSAO_FRAGMENT).toContain('out vec4 fragColor')
    })

})


test('SSAO_BLUR_VERTEX is same as SSAO_VERTEX', () => {
    expect(SSAO_BLUR_VERTEX).toBe(SSAO_VERTEX)
})


describe('SSAO_BLUR_FRAGMENT', () => {

    test('is a string', () => {
        expect(typeof SSAO_BLUR_FRAGMENT).toBe('string')
    })


    test('contains version directive', () => {
        expect(SSAO_BLUR_FRAGMENT).toContain('#version 300 es')
    })


    test('declares uSSAOTexture uniform', () => {
        expect(SSAO_BLUR_FRAGMENT).toContain('uniform sampler2D uSSAOTexture')
    })


    test('declares uDepth uniform', () => {
        expect(SSAO_BLUR_FRAGMENT).toContain('uniform highp sampler2D uDepth')
    })


    test('declares uTexelSize uniform', () => {
        expect(SSAO_BLUR_FRAGMENT).toContain('uniform vec2 uTexelSize')
    })

})


describe('SSAO_SHADER_DEF', () => {

    test('has vertex property', () => {
        expect(SSAO_SHADER_DEF.vertex).toBe(SSAO_VERTEX)
    })


    test('has fragment property', () => {
        expect(SSAO_SHADER_DEF.fragment).toBe(SSAO_FRAGMENT)
    })


    test('has uniforms array', () => {
        expect(SSAO_SHADER_DEF.uniforms).toEqual([
            'uDepth',
            'uGNormal',
            'uProjection',
            'uInverseViewProjection',
            'uView',
            'uTexelSize',
            'uRadius',
            'uBias',
            'uIntensity'
        ])
    })


    test('has attributes array', () => {
        expect(SSAO_SHADER_DEF.attributes).toEqual(['aPosition', 'aTexCoord'])
    })

})


describe('SSAO_BLUR_SHADER_DEF', () => {

    test('has vertex property', () => {
        expect(SSAO_BLUR_SHADER_DEF.vertex).toBe(SSAO_BLUR_VERTEX)
    })


    test('has fragment property', () => {
        expect(SSAO_BLUR_SHADER_DEF.fragment).toBe(SSAO_BLUR_FRAGMENT)
    })


    test('has uniforms array', () => {
        expect(SSAO_BLUR_SHADER_DEF.uniforms).toEqual(['uSSAOTexture', 'uDepth', 'uTexelSize'])
    })


    test('has attributes array', () => {
        expect(SSAO_BLUR_SHADER_DEF.attributes).toEqual(['aPosition', 'aTexCoord'])
    })

})
