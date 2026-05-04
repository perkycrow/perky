import {describe, test, expect} from 'vitest'
import {
    BLOOM_EXTRACT_FRAGMENT,
    BLOOM_BLUR_FRAGMENT,
    BLOOM_COMPOSITE_FRAGMENT,
    BLOOM_EXTRACT_SHADER_DEF,
    BLOOM_BLUR_SHADER_DEF,
    BLOOM_COMPOSITE_SHADER_DEF
} from './bloom_shader.js'


describe('BLOOM_EXTRACT_FRAGMENT', () => {

    test('is a string', () => {
        expect(typeof BLOOM_EXTRACT_FRAGMENT).toBe('string')
    })


    test('contains version directive', () => {
        expect(BLOOM_EXTRACT_FRAGMENT).toContain('#version 300 es')
    })


    test('declares uSceneColor uniform', () => {
        expect(BLOOM_EXTRACT_FRAGMENT).toContain('uniform sampler2D uSceneColor')
    })


    test('declares uThreshold uniform', () => {
        expect(BLOOM_EXTRACT_FRAGMENT).toContain('uniform float uThreshold')
    })


    test('declares uSoftThreshold uniform', () => {
        expect(BLOOM_EXTRACT_FRAGMENT).toContain('uniform float uSoftThreshold')
    })

})


describe('BLOOM_BLUR_FRAGMENT', () => {

    test('is a string', () => {
        expect(typeof BLOOM_BLUR_FRAGMENT).toBe('string')
    })


    test('contains version directive', () => {
        expect(BLOOM_BLUR_FRAGMENT).toContain('#version 300 es')
    })


    test('declares uTexture uniform', () => {
        expect(BLOOM_BLUR_FRAGMENT).toContain('uniform sampler2D uTexture')
    })


    test('declares uDirection uniform', () => {
        expect(BLOOM_BLUR_FRAGMENT).toContain('uniform vec2 uDirection')
    })

})


describe('BLOOM_COMPOSITE_FRAGMENT', () => {

    test('is a string', () => {
        expect(typeof BLOOM_COMPOSITE_FRAGMENT).toBe('string')
    })


    test('declares uBloomTexture uniform', () => {
        expect(BLOOM_COMPOSITE_FRAGMENT).toContain('uniform sampler2D uBloomTexture')
    })


    test('declares uBloomIntensity uniform', () => {
        expect(BLOOM_COMPOSITE_FRAGMENT).toContain('uniform float uBloomIntensity')
    })

})


describe('BLOOM_EXTRACT_SHADER_DEF', () => {

    test('has vertex property', () => {
        expect(BLOOM_EXTRACT_SHADER_DEF.vertex).toBeDefined()
    })


    test('has fragment property', () => {
        expect(BLOOM_EXTRACT_SHADER_DEF.fragment).toBe(BLOOM_EXTRACT_FRAGMENT)
    })


    test('has uniforms array', () => {
        expect(BLOOM_EXTRACT_SHADER_DEF.uniforms).toEqual(['uSceneColor', 'uThreshold', 'uSoftThreshold'])
    })


    test('has attributes array', () => {
        expect(BLOOM_EXTRACT_SHADER_DEF.attributes).toEqual(['aPosition', 'aTexCoord'])
    })

})


describe('BLOOM_BLUR_SHADER_DEF', () => {

    test('has fragment property', () => {
        expect(BLOOM_BLUR_SHADER_DEF.fragment).toBe(BLOOM_BLUR_FRAGMENT)
    })


    test('has uniforms array', () => {
        expect(BLOOM_BLUR_SHADER_DEF.uniforms).toEqual(['uTexture', 'uDirection', 'uTexelSize'])
    })

})


describe('BLOOM_COMPOSITE_SHADER_DEF', () => {

    test('has fragment property', () => {
        expect(BLOOM_COMPOSITE_SHADER_DEF.fragment).toBe(BLOOM_COMPOSITE_FRAGMENT)
    })


    test('has uniforms array', () => {
        expect(BLOOM_COMPOSITE_SHADER_DEF.uniforms).toEqual(['uSceneColor', 'uBloomTexture', 'uBloomIntensity'])
    })

})
