import {describe, test, expect} from 'vitest'
import {
    CINEMATIC_VERTEX,
    CINEMATIC_FRAGMENT,
    CINEMATIC_SHADER_DEF
} from './cinematic_shader.js'


describe('CINEMATIC_VERTEX', () => {

    test('is a string', () => {
        expect(typeof CINEMATIC_VERTEX).toBe('string')
    })


    test('contains version directive', () => {
        expect(CINEMATIC_VERTEX).toContain('#version 300 es')
    })


    test('declares aPosition attribute', () => {
        expect(CINEMATIC_VERTEX).toContain('in vec2 aPosition')
    })


    test('declares aTexCoord attribute', () => {
        expect(CINEMATIC_VERTEX).toContain('in vec2 aTexCoord')
    })

})


describe('CINEMATIC_FRAGMENT', () => {

    test('is a string', () => {
        expect(typeof CINEMATIC_FRAGMENT).toBe('string')
    })


    test('contains version directive', () => {
        expect(CINEMATIC_FRAGMENT).toContain('#version 300 es')
    })


    test('declares uSceneColor uniform', () => {
        expect(CINEMATIC_FRAGMENT).toContain('uniform sampler2D uSceneColor')
    })


    test('declares uTime uniform', () => {
        expect(CINEMATIC_FRAGMENT).toContain('uniform float uTime')
    })


    test('declares vignette uniforms', () => {
        expect(CINEMATIC_FRAGMENT).toContain('uniform float uVignetteIntensity')
        expect(CINEMATIC_FRAGMENT).toContain('uniform float uVignetteSmoothness')
    })


    test('declares color correction uniforms', () => {
        expect(CINEMATIC_FRAGMENT).toContain('uniform float uSaturation')
        expect(CINEMATIC_FRAGMENT).toContain('uniform float uTemperature')
        expect(CINEMATIC_FRAGMENT).toContain('uniform float uBrightness')
        expect(CINEMATIC_FRAGMENT).toContain('uniform float uContrast')
    })


    test('declares grain uniforms', () => {
        expect(CINEMATIC_FRAGMENT).toContain('uniform float uGrainIntensity')
    })


    test('declares paper texture uniforms', () => {
        expect(CINEMATIC_FRAGMENT).toContain('uniform sampler2D uPaperTexture')
        expect(CINEMATIC_FRAGMENT).toContain('uniform float uPaperIntensity')
    })


    test('declares fragColor output', () => {
        expect(CINEMATIC_FRAGMENT).toContain('out vec4 fragColor')
    })

})


describe('CINEMATIC_SHADER_DEF', () => {

    test('has vertex property', () => {
        expect(CINEMATIC_SHADER_DEF.vertex).toBe(CINEMATIC_VERTEX)
    })


    test('has fragment property', () => {
        expect(CINEMATIC_SHADER_DEF.fragment).toBe(CINEMATIC_FRAGMENT)
    })


    test('has uniforms array', () => {
        expect(CINEMATIC_SHADER_DEF.uniforms).toEqual([
            'uSceneColor',
            'uTime',
            'uVignetteIntensity',
            'uVignetteSmoothness',
            'uSaturation',
            'uTemperature',
            'uBrightness',
            'uContrast',
            'uGrainIntensity',
            'uPaperTexture',
            'uPaperIntensity',
            'uColorLevels'
        ])
    })


    test('has attributes array', () => {
        expect(CINEMATIC_SHADER_DEF.attributes).toEqual(['aPosition', 'aTexCoord'])
    })

})
