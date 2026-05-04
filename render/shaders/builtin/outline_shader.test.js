import {describe, test, expect} from 'vitest'
import {
    OUTLINE_VERTEX,
    OUTLINE_FRAGMENT,
    OUTLINE_SHADER_DEF
} from './outline_shader.js'


describe('OUTLINE_VERTEX', () => {

    test('is a string', () => {
        expect(typeof OUTLINE_VERTEX).toBe('string')
    })


    test('contains version directive', () => {
        expect(OUTLINE_VERTEX).toContain('#version 300 es')
    })


    test('declares aPosition attribute', () => {
        expect(OUTLINE_VERTEX).toContain('in vec2 aPosition')
    })


    test('declares aTexCoord attribute', () => {
        expect(OUTLINE_VERTEX).toContain('in vec2 aTexCoord')
    })

})


describe('OUTLINE_FRAGMENT', () => {

    test('is a string', () => {
        expect(typeof OUTLINE_FRAGMENT).toBe('string')
    })


    test('contains version directive', () => {
        expect(OUTLINE_FRAGMENT).toContain('#version 300 es')
    })


    test('declares uSceneColor uniform', () => {
        expect(OUTLINE_FRAGMENT).toContain('uniform sampler2D uSceneColor')
    })


    test('declares uDepth uniform', () => {
        expect(OUTLINE_FRAGMENT).toContain('uniform highp sampler2D uDepth')
    })


    test('declares uGNormal uniform', () => {
        expect(OUTLINE_FRAGMENT).toContain('uniform sampler2D uGNormal')
    })


    test('declares uTexelSize uniform', () => {
        expect(OUTLINE_FRAGMENT).toContain('uniform vec2 uTexelSize')
    })


    test('declares uOutlineColor uniform', () => {
        expect(OUTLINE_FRAGMENT).toContain('uniform vec3 uOutlineColor')
    })


    test('declares threshold uniforms', () => {
        expect(OUTLINE_FRAGMENT).toContain('uniform float uDepthThreshold')
        expect(OUTLINE_FRAGMENT).toContain('uniform float uNormalThreshold')
    })


    test('declares uWobble uniform', () => {
        expect(OUTLINE_FRAGMENT).toContain('uniform float uWobble')
    })


    test('declares fragColor output', () => {
        expect(OUTLINE_FRAGMENT).toContain('out vec4 fragColor')
    })

})


describe('OUTLINE_SHADER_DEF', () => {

    test('has vertex property', () => {
        expect(OUTLINE_SHADER_DEF.vertex).toBe(OUTLINE_VERTEX)
    })


    test('has fragment property', () => {
        expect(OUTLINE_SHADER_DEF.fragment).toBe(OUTLINE_FRAGMENT)
    })


    test('has uniforms array', () => {
        expect(OUTLINE_SHADER_DEF.uniforms).toEqual([
            'uSceneColor',
            'uDepth',
            'uGNormal',
            'uTexelSize',
            'uOutlineColor',
            'uDepthThreshold',
            'uNormalThreshold',
            'uWobble',
            'uInverseViewProjection'
        ])
    })


    test('has attributes array', () => {
        expect(OUTLINE_SHADER_DEF.attributes).toEqual(['aPosition', 'aTexCoord'])
    })

})
