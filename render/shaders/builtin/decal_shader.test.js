import {
    DECAL_VERTEX,
    DECAL_FRAGMENT,
    DECAL_SHADER_DEF
} from './decal_shader.js'


describe('DECAL_VERTEX', () => {

    test('is a string', () => {
        expect(typeof DECAL_VERTEX).toBe('string')
    })

    test('contains version directive', () => {
        expect(DECAL_VERTEX).toContain('#version 300 es')
    })

    test('declares aPosition attribute with layout', () => {
        expect(DECAL_VERTEX).toContain('layout(location = 0) in vec3 aPosition')
    })

    test('declares aTexCoord attribute with layout', () => {
        expect(DECAL_VERTEX).toContain('layout(location = 2) in vec2 aTexCoord')
    })

    test('declares camera uniforms', () => {
        expect(DECAL_VERTEX).toContain('uniform mat4 uProjection')
        expect(DECAL_VERTEX).toContain('uniform mat4 uView')
    })

    test('declares model matrix uniform', () => {
        expect(DECAL_VERTEX).toContain('uniform mat4 uModel')
    })

    test('transforms position through model matrix', () => {
        expect(DECAL_VERTEX).toContain('uModel * vec4(aPosition, 1.0)')
    })

    test('computes fog depth from view space', () => {
        expect(DECAL_VERTEX).toContain('vFogDepth = -viewPos.z')
    })

})


describe('DECAL_FRAGMENT', () => {

    test('is a string', () => {
        expect(typeof DECAL_FRAGMENT).toBe('string')
    })

    test('contains version directive', () => {
        expect(DECAL_FRAGMENT).toContain('#version 300 es')
    })

    test('declares texture uniforms', () => {
        expect(DECAL_FRAGMENT).toContain('uniform sampler2D uTexture')
        expect(DECAL_FRAGMENT).toContain('uniform float uHasTexture')
    })

    test('declares material uniforms', () => {
        expect(DECAL_FRAGMENT).toContain('uniform vec3 uColor')
        expect(DECAL_FRAGMENT).toContain('uniform vec3 uEmissive')
        expect(DECAL_FRAGMENT).toContain('uniform float uOpacity')
    })

    test('declares fog uniforms', () => {
        expect(DECAL_FRAGMENT).toContain('uniform float uFogNear')
        expect(DECAL_FRAGMENT).toContain('uniform float uFogFar')
        expect(DECAL_FRAGMENT).toContain('uniform vec3 uFogColor')
    })

    test('discards transparent fragments', () => {
        expect(DECAL_FRAGMENT).toContain('discard')
    })

    test('applies fog', () => {
        expect(DECAL_FRAGMENT).toContain('mix(uFogColor, color, fogFactor)')
    })

    test('outputs alpha from opacity', () => {
        expect(DECAL_FRAGMENT).toContain('texColor.a * uOpacity')
    })

    test('declares fragColor output', () => {
        expect(DECAL_FRAGMENT).toContain('out vec4 fragColor')
    })

})


describe('DECAL_SHADER_DEF', () => {

    test('has vertex property', () => {
        expect(DECAL_SHADER_DEF.vertex).toBe(DECAL_VERTEX)
    })

    test('has fragment property', () => {
        expect(DECAL_SHADER_DEF.fragment).toBe(DECAL_FRAGMENT)
    })

    test('has uniforms array', () => {
        expect(DECAL_SHADER_DEF.uniforms).toEqual([
            'uProjection',
            'uView',
            'uModel',
            'uTexture',
            'uHasTexture',
            'uColor',
            'uEmissive',
            'uOpacity',
            'uFogNear',
            'uFogFar',
            'uFogColor'
        ])
    })

    test('has attributes array', () => {
        expect(DECAL_SHADER_DEF.attributes).toEqual([
            'aPosition',
            'aTexCoord'
        ])
    })

})
