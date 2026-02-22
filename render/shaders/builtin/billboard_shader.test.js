import {
    BILLBOARD_VERTEX,
    BILLBOARD_FRAGMENT,
    BILLBOARD_SHADER_DEF
} from './billboard_shader.js'


describe('BILLBOARD_VERTEX', () => {

    test('is a string', () => {
        expect(typeof BILLBOARD_VERTEX).toBe('string')
    })

    test('contains version directive', () => {
        expect(BILLBOARD_VERTEX).toContain('#version 300 es')
    })

    test('declares aPosition attribute with layout', () => {
        expect(BILLBOARD_VERTEX).toContain('layout(location = 0) in vec3 aPosition')
    })

    test('declares aTexCoord attribute with layout', () => {
        expect(BILLBOARD_VERTEX).toContain('layout(location = 2) in vec2 aTexCoord')
    })

    test('declares camera uniforms', () => {
        expect(BILLBOARD_VERTEX).toContain('uniform mat4 uProjection')
        expect(BILLBOARD_VERTEX).toContain('uniform mat4 uView')
    })

    test('declares billboard uniforms', () => {
        expect(BILLBOARD_VERTEX).toContain('uniform vec3 uCenter')
        expect(BILLBOARD_VERTEX).toContain('uniform vec2 uSize')
    })

    test('extracts camera axes from view matrix', () => {
        expect(BILLBOARD_VERTEX).toContain('uView[0][0]')
        expect(BILLBOARD_VERTEX).toContain('uView[1][0]')
        expect(BILLBOARD_VERTEX).toContain('uView[0][1]')
        expect(BILLBOARD_VERTEX).toContain('uView[1][1]')
    })

    test('expands quad around center', () => {
        expect(BILLBOARD_VERTEX).toContain('uCenter + right * aPosition.x * uSize.x + up * aPosition.y * uSize.y')
    })

    test('computes fog depth from view space', () => {
        expect(BILLBOARD_VERTEX).toContain('vFogDepth = -viewPos.z')
    })

})


describe('BILLBOARD_FRAGMENT', () => {

    test('is a string', () => {
        expect(typeof BILLBOARD_FRAGMENT).toBe('string')
    })

    test('contains version directive', () => {
        expect(BILLBOARD_FRAGMENT).toContain('#version 300 es')
    })

    test('declares texture uniforms', () => {
        expect(BILLBOARD_FRAGMENT).toContain('uniform sampler2D uTexture')
        expect(BILLBOARD_FRAGMENT).toContain('uniform float uHasTexture')
    })

    test('declares material uniforms', () => {
        expect(BILLBOARD_FRAGMENT).toContain('uniform vec3 uColor')
        expect(BILLBOARD_FRAGMENT).toContain('uniform vec3 uEmissive')
        expect(BILLBOARD_FRAGMENT).toContain('uniform float uOpacity')
    })

    test('declares fog uniforms', () => {
        expect(BILLBOARD_FRAGMENT).toContain('uniform float uFogNear')
        expect(BILLBOARD_FRAGMENT).toContain('uniform float uFogFar')
        expect(BILLBOARD_FRAGMENT).toContain('uniform vec3 uFogColor')
    })

    test('applies fog', () => {
        expect(BILLBOARD_FRAGMENT).toContain('mix(uFogColor, color, fogFactor)')
    })

    test('outputs alpha from opacity', () => {
        expect(BILLBOARD_FRAGMENT).toContain('texColor.a * uOpacity')
    })

    test('declares fragColor output', () => {
        expect(BILLBOARD_FRAGMENT).toContain('out vec4 fragColor')
    })

})


describe('BILLBOARD_SHADER_DEF', () => {

    test('has vertex property', () => {
        expect(BILLBOARD_SHADER_DEF.vertex).toBe(BILLBOARD_VERTEX)
    })

    test('has fragment property', () => {
        expect(BILLBOARD_SHADER_DEF.fragment).toBe(BILLBOARD_FRAGMENT)
    })

    test('has uniforms array', () => {
        expect(BILLBOARD_SHADER_DEF.uniforms).toEqual([
            'uProjection',
            'uView',
            'uCenter',
            'uSize',
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
        expect(BILLBOARD_SHADER_DEF.attributes).toEqual([
            'aPosition',
            'aTexCoord'
        ])
    })

})
