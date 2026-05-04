import {describe, test, expect} from 'vitest'
import {
    VOLUMETRIC_FOG_VERTEX,
    VOLUMETRIC_FOG_FRAGMENT,
    FOG_BLUR_VERTEX,
    FOG_BLUR_FRAGMENT,
    VOLUMETRIC_FOG_SHADER_DEF,
    FOG_BLUR_SHADER_DEF
} from './volumetric_fog_shader.js'


describe('VOLUMETRIC_FOG_VERTEX', () => {

    test('is a string', () => {
        expect(typeof VOLUMETRIC_FOG_VERTEX).toBe('string')
    })


    test('contains version directive', () => {
        expect(VOLUMETRIC_FOG_VERTEX).toContain('#version 300 es')
    })


    test('declares aPosition attribute', () => {
        expect(VOLUMETRIC_FOG_VERTEX).toContain('in vec2 aPosition')
    })


    test('declares aTexCoord attribute', () => {
        expect(VOLUMETRIC_FOG_VERTEX).toContain('in vec2 aTexCoord')
    })

})


describe('VOLUMETRIC_FOG_FRAGMENT', () => {

    test('is a string', () => {
        expect(typeof VOLUMETRIC_FOG_FRAGMENT).toBe('string')
    })


    test('contains version directive', () => {
        expect(VOLUMETRIC_FOG_FRAGMENT).toContain('#version 300 es')
    })


    test('declares uDepth uniform', () => {
        expect(VOLUMETRIC_FOG_FRAGMENT).toContain('uniform highp sampler2D uDepth')
    })


    test('declares uLightData uniform', () => {
        expect(VOLUMETRIC_FOG_FRAGMENT).toContain('uniform highp sampler2D uLightData')
    })


    test('declares uInverseViewProjection uniform', () => {
        expect(VOLUMETRIC_FOG_FRAGMENT).toContain('uniform mat4 uInverseViewProjection')
    })


    test('declares uCameraPosition uniform', () => {
        expect(VOLUMETRIC_FOG_FRAGMENT).toContain('uniform vec3 uCameraPosition')
    })


    test('declares fog density uniforms', () => {
        expect(VOLUMETRIC_FOG_FRAGMENT).toContain('uniform float uFogDensity')
        expect(VOLUMETRIC_FOG_FRAGMENT).toContain('uniform float uFogHeightFalloff')
        expect(VOLUMETRIC_FOG_FRAGMENT).toContain('uniform float uFogBaseHeight')
    })


    test('declares fog noise uniforms', () => {
        expect(VOLUMETRIC_FOG_FRAGMENT).toContain('uniform float uFogNoiseScale')
        expect(VOLUMETRIC_FOG_FRAGMENT).toContain('uniform float uFogNoiseStrength')
    })


    test('declares wind uniforms', () => {
        expect(VOLUMETRIC_FOG_FRAGMENT).toContain('uniform vec2 uFogWindDirection')
        expect(VOLUMETRIC_FOG_FRAGMENT).toContain('uniform float uFogWindSpeed')
    })


    test('declares fragColor output', () => {
        expect(VOLUMETRIC_FOG_FRAGMENT).toContain('out vec4 fragColor')
    })

})


test('FOG_BLUR_VERTEX is same as VOLUMETRIC_FOG_VERTEX', () => {
    expect(FOG_BLUR_VERTEX).toBe(VOLUMETRIC_FOG_VERTEX)
})


describe('FOG_BLUR_FRAGMENT', () => {

    test('is a string', () => {
        expect(typeof FOG_BLUR_FRAGMENT).toBe('string')
    })


    test('contains version directive', () => {
        expect(FOG_BLUR_FRAGMENT).toContain('#version 300 es')
    })


    test('declares uFogTexture uniform', () => {
        expect(FOG_BLUR_FRAGMENT).toContain('uniform sampler2D uFogTexture')
    })


    test('declares uSceneColor uniform', () => {
        expect(FOG_BLUR_FRAGMENT).toContain('uniform sampler2D uSceneColor')
    })


    test('declares uDepth uniform', () => {
        expect(FOG_BLUR_FRAGMENT).toContain('uniform highp sampler2D uDepth')
    })

})


describe('VOLUMETRIC_FOG_SHADER_DEF', () => {

    test('has vertex property', () => {
        expect(VOLUMETRIC_FOG_SHADER_DEF.vertex).toBe(VOLUMETRIC_FOG_VERTEX)
    })


    test('has fragment property', () => {
        expect(VOLUMETRIC_FOG_SHADER_DEF.fragment).toBe(VOLUMETRIC_FOG_FRAGMENT)
    })


    test('has uniforms array', () => {
        expect(VOLUMETRIC_FOG_SHADER_DEF.uniforms).toEqual([
            'uDepth',
            'uLightData',
            'uInverseViewProjection',
            'uCameraPosition',
            'uNumLights',
            'uTime',
            'uFogDensity',
            'uFogHeightFalloff',
            'uFogBaseHeight',
            'uFogNoiseScale',
            'uFogNoiseStrength',
            'uFogWindDirection',
            'uFogWindSpeed',
            'uFogScatterAnisotropy',
            'uFogColor',
            'uFogSteps',
            'uFogMaxDistance',
            'uFogStartDistance'
        ])
    })


    test('has attributes array', () => {
        expect(VOLUMETRIC_FOG_SHADER_DEF.attributes).toEqual(['aPosition', 'aTexCoord'])
    })

})


describe('FOG_BLUR_SHADER_DEF', () => {

    test('has vertex property', () => {
        expect(FOG_BLUR_SHADER_DEF.vertex).toBe(FOG_BLUR_VERTEX)
    })


    test('has fragment property', () => {
        expect(FOG_BLUR_SHADER_DEF.fragment).toBe(FOG_BLUR_FRAGMENT)
    })


    test('has uniforms array', () => {
        expect(FOG_BLUR_SHADER_DEF.uniforms).toEqual(['uFogTexture', 'uSceneColor', 'uDepth', 'uTexelSize'])
    })


    test('has attributes array', () => {
        expect(FOG_BLUR_SHADER_DEF.attributes).toEqual(['aPosition', 'aTexCoord'])
    })

})
