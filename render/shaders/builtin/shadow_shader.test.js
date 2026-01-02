import {describe, test, expect} from 'vitest'
import {
    SHADOW_VERTEX,
    SHADOW_FRAGMENT,
    SHADOW_SHADER_DEF
} from './shadow_shader.js'


describe('SHADOW_VERTEX', () => {

    test('is a string', () => {
        expect(typeof SHADOW_VERTEX).toBe('string')
    })


    test('contains version directive', () => {
        expect(SHADOW_VERTEX).toContain('#version 300 es')
    })


    test('declares aPosition attribute', () => {
        expect(SHADOW_VERTEX).toContain('in vec2 aPosition')
    })


    test('declares aTexCoord attribute', () => {
        expect(SHADOW_VERTEX).toContain('in vec2 aTexCoord')
    })


    test('declares aOpacity attribute', () => {
        expect(SHADOW_VERTEX).toContain('in float aOpacity')
    })


    test('declares aAnchorY attribute', () => {
        expect(SHADOW_VERTEX).toContain('in float aAnchorY')
    })


    test('declares shadow uniforms', () => {
        expect(SHADOW_VERTEX).toContain('uniform float uShadowSkewX')
        expect(SHADOW_VERTEX).toContain('uniform float uShadowScaleY')
        expect(SHADOW_VERTEX).toContain('uniform float uShadowOffsetY')
    })

})


describe('SHADOW_FRAGMENT', () => {

    test('is a string', () => {
        expect(typeof SHADOW_FRAGMENT).toBe('string')
    })


    test('contains version directive', () => {
        expect(SHADOW_FRAGMENT).toContain('#version 300 es')
    })


    test('declares uTexture uniform', () => {
        expect(SHADOW_FRAGMENT).toContain('uniform sampler2D uTexture')
    })


    test('declares uShadowColor uniform', () => {
        expect(SHADOW_FRAGMENT).toContain('uniform vec4 uShadowColor')
    })


    test('declares fragColor output', () => {
        expect(SHADOW_FRAGMENT).toContain('out vec4 fragColor')
    })

})


describe('SHADOW_SHADER_DEF', () => {

    test('has vertex property', () => {
        expect(SHADOW_SHADER_DEF.vertex).toBe(SHADOW_VERTEX)
    })


    test('has fragment property', () => {
        expect(SHADOW_SHADER_DEF.fragment).toBe(SHADOW_FRAGMENT)
    })


    test('has uniforms array', () => {
        expect(SHADOW_SHADER_DEF.uniforms).toEqual([
            'uProjectionMatrix',
            'uViewMatrix',
            'uModelMatrix',
            'uShadowSkewX',
            'uShadowScaleY',
            'uShadowOffsetY',
            'uTexture',
            'uShadowColor'
        ])
    })


    test('has attributes array', () => {
        expect(SHADOW_SHADER_DEF.attributes).toEqual(['aPosition', 'aTexCoord', 'aOpacity', 'aAnchorY'])
    })

})
