import {describe, test, expect} from 'vitest'
import {
    SMAA_EDGE_VERTEX,
    SMAA_EDGE_FRAGMENT,
    SMAA_WEIGHT_VERTEX,
    SMAA_WEIGHT_FRAGMENT,
    SMAA_BLEND_VERTEX,
    SMAA_BLEND_FRAGMENT,
    SMAA_EDGE_SHADER_DEF,
    SMAA_WEIGHT_SHADER_DEF,
    SMAA_BLEND_SHADER_DEF
} from './smaa_shader.js'


describe('SMAA_EDGE_VERTEX', () => {

    test('is a string', () => {
        expect(typeof SMAA_EDGE_VERTEX).toBe('string')
    })


    test('contains version directive', () => {
        expect(SMAA_EDGE_VERTEX).toContain('#version 300 es')
    })


    test('declares aPosition attribute', () => {
        expect(SMAA_EDGE_VERTEX).toContain('in vec2 aPosition')
    })


    test('declares uTexelSize uniform', () => {
        expect(SMAA_EDGE_VERTEX).toContain('uniform vec2 uTexelSize')
    })

})


describe('SMAA_EDGE_FRAGMENT', () => {

    test('is a string', () => {
        expect(typeof SMAA_EDGE_FRAGMENT).toBe('string')
    })


    test('contains version directive', () => {
        expect(SMAA_EDGE_FRAGMENT).toContain('#version 300 es')
    })


    test('declares uColorTexture uniform', () => {
        expect(SMAA_EDGE_FRAGMENT).toContain('uniform sampler2D uColorTexture')
    })


    test('declares fragColor output', () => {
        expect(SMAA_EDGE_FRAGMENT).toContain('out vec4 fragColor')
    })

})


describe('SMAA_WEIGHT_VERTEX', () => {

    test('is a string', () => {
        expect(typeof SMAA_WEIGHT_VERTEX).toBe('string')
    })


    test('declares uViewportSize uniform', () => {
        expect(SMAA_WEIGHT_VERTEX).toContain('uniform vec2 uViewportSize')
    })

})


describe('SMAA_WEIGHT_FRAGMENT', () => {

    test('is a string', () => {
        expect(typeof SMAA_WEIGHT_FRAGMENT).toBe('string')
    })


    test('declares uEdgesTexture uniform', () => {
        expect(SMAA_WEIGHT_FRAGMENT).toContain('uniform sampler2D uEdgesTexture')
    })


    test('declares uAreaTexture uniform', () => {
        expect(SMAA_WEIGHT_FRAGMENT).toContain('uniform sampler2D uAreaTexture')
    })


    test('declares uSearchTexture uniform', () => {
        expect(SMAA_WEIGHT_FRAGMENT).toContain('uniform sampler2D uSearchTexture')
    })

})


describe('SMAA_BLEND_VERTEX', () => {

    test('is a string', () => {
        expect(typeof SMAA_BLEND_VERTEX).toBe('string')
    })


    test('declares uTexelSize uniform', () => {
        expect(SMAA_BLEND_VERTEX).toContain('uniform vec2 uTexelSize')
    })

})


describe('SMAA_BLEND_FRAGMENT', () => {

    test('is a string', () => {
        expect(typeof SMAA_BLEND_FRAGMENT).toBe('string')
    })


    test('declares uColorTexture uniform', () => {
        expect(SMAA_BLEND_FRAGMENT).toContain('uniform sampler2D uColorTexture')
    })


    test('declares uBlendTexture uniform', () => {
        expect(SMAA_BLEND_FRAGMENT).toContain('uniform sampler2D uBlendTexture')
    })

})


describe('SMAA_EDGE_SHADER_DEF', () => {

    test('has vertex property', () => {
        expect(SMAA_EDGE_SHADER_DEF.vertex).toBe(SMAA_EDGE_VERTEX)
    })


    test('has fragment property', () => {
        expect(SMAA_EDGE_SHADER_DEF.fragment).toBe(SMAA_EDGE_FRAGMENT)
    })


    test('has uniforms array', () => {
        expect(SMAA_EDGE_SHADER_DEF.uniforms).toEqual(['uColorTexture', 'uTexelSize'])
    })


    test('has attributes array', () => {
        expect(SMAA_EDGE_SHADER_DEF.attributes).toEqual(['aPosition'])
    })

})


describe('SMAA_WEIGHT_SHADER_DEF', () => {

    test('has vertex property', () => {
        expect(SMAA_WEIGHT_SHADER_DEF.vertex).toBe(SMAA_WEIGHT_VERTEX)
    })


    test('has fragment property', () => {
        expect(SMAA_WEIGHT_SHADER_DEF.fragment).toBe(SMAA_WEIGHT_FRAGMENT)
    })


    test('has uniforms array', () => {
        expect(SMAA_WEIGHT_SHADER_DEF.uniforms).toEqual([
            'uEdgesTexture',
            'uAreaTexture',
            'uSearchTexture',
            'uViewportSize',
            'uTexelSize'
        ])
    })

})


describe('SMAA_BLEND_SHADER_DEF', () => {

    test('has vertex property', () => {
        expect(SMAA_BLEND_SHADER_DEF.vertex).toBe(SMAA_BLEND_VERTEX)
    })


    test('has fragment property', () => {
        expect(SMAA_BLEND_SHADER_DEF.fragment).toBe(SMAA_BLEND_FRAGMENT)
    })


    test('has uniforms array', () => {
        expect(SMAA_BLEND_SHADER_DEF.uniforms).toEqual(['uColorTexture', 'uBlendTexture', 'uTexelSize'])
    })

})
