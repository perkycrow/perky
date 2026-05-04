import {describe, test, expect} from 'vitest'
import {
    SPRITE3D_GBUFFER_VERTEX,
    SPRITE3D_GBUFFER_FRAGMENT,
    SPRITE3D_GBUFFER_SHADER_DEF
} from './sprite3d_gbuffer_shader.js'


describe('SPRITE3D_GBUFFER_VERTEX', () => {

    test('is a string', () => {
        expect(typeof SPRITE3D_GBUFFER_VERTEX).toBe('string')
    })


    test('contains version directive', () => {
        expect(SPRITE3D_GBUFFER_VERTEX).toContain('#version 300 es')
    })


    test('declares aPosition attribute', () => {
        expect(SPRITE3D_GBUFFER_VERTEX).toContain('in vec3 aPosition')
    })


    test('declares aTexCoord attribute', () => {
        expect(SPRITE3D_GBUFFER_VERTEX).toContain('in vec2 aTexCoord')
    })


    test('declares matrix uniforms', () => {
        expect(SPRITE3D_GBUFFER_VERTEX).toContain('uniform mat4 uProjection')
        expect(SPRITE3D_GBUFFER_VERTEX).toContain('uniform mat4 uView')
    })


    test('declares uCenter uniform', () => {
        expect(SPRITE3D_GBUFFER_VERTEX).toContain('uniform vec3 uCenter')
    })


    test('declares uSize uniform', () => {
        expect(SPRITE3D_GBUFFER_VERTEX).toContain('uniform vec2 uSize')
    })


    test('declares uAnchor uniform', () => {
        expect(SPRITE3D_GBUFFER_VERTEX).toContain('uniform vec2 uAnchor')
    })

})


describe('SPRITE3D_GBUFFER_FRAGMENT', () => {

    test('is a string', () => {
        expect(typeof SPRITE3D_GBUFFER_FRAGMENT).toBe('string')
    })


    test('contains version directive', () => {
        expect(SPRITE3D_GBUFFER_FRAGMENT).toContain('#version 300 es')
    })


    test('declares uTexture uniform', () => {
        expect(SPRITE3D_GBUFFER_FRAGMENT).toContain('uniform sampler2D uTexture')
    })


    test('declares uHasTexture uniform', () => {
        expect(SPRITE3D_GBUFFER_FRAGMENT).toContain('uniform float uHasTexture')
    })


    test('declares uMaterialColor uniform', () => {
        expect(SPRITE3D_GBUFFER_FRAGMENT).toContain('uniform vec3 uMaterialColor')
    })


    test('declares material uniforms', () => {
        expect(SPRITE3D_GBUFFER_FRAGMENT).toContain('uniform float uRoughness')
        expect(SPRITE3D_GBUFFER_FRAGMENT).toContain('uniform float uSpecular')
        expect(SPRITE3D_GBUFFER_FRAGMENT).toContain('uniform float uUnlit')
    })


    test('declares uAlphaThreshold uniform', () => {
        expect(SPRITE3D_GBUFFER_FRAGMENT).toContain('uniform float uAlphaThreshold')
    })


    test('declares MRT outputs', () => {
        expect(SPRITE3D_GBUFFER_FRAGMENT).toContain('out vec4 gAlbedo')
        expect(SPRITE3D_GBUFFER_FRAGMENT).toContain('out vec4 gNormal')
        expect(SPRITE3D_GBUFFER_FRAGMENT).toContain('out vec4 gMaterial')
    })

})


describe('SPRITE3D_GBUFFER_SHADER_DEF', () => {

    test('has vertex property', () => {
        expect(SPRITE3D_GBUFFER_SHADER_DEF.vertex).toBe(SPRITE3D_GBUFFER_VERTEX)
    })


    test('has fragment property', () => {
        expect(SPRITE3D_GBUFFER_SHADER_DEF.fragment).toBe(SPRITE3D_GBUFFER_FRAGMENT)
    })


    test('has uniforms array', () => {
        expect(SPRITE3D_GBUFFER_SHADER_DEF.uniforms).toEqual([
            'uProjection',
            'uView',
            'uCenter',
            'uSize',
            'uAnchor',
            'uTexture',
            'uHasTexture',
            'uMaterialColor',
            'uRoughness',
            'uSpecular',
            'uUnlit',
            'uMaterialEmissive',
            'uAlphaThreshold'
        ])
    })


    test('has attributes array', () => {
        expect(SPRITE3D_GBUFFER_SHADER_DEF.attributes).toEqual(['aPosition', 'aTexCoord'])
    })

})
