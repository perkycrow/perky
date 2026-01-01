import {describe, test, expect} from 'vitest'
import {
    SPRITE_VERTEX,
    SPRITE_FRAGMENT,
    SPRITE_SHADER_DEF
} from './sprite_shader.js'


describe('SPRITE_VERTEX', () => {

    test('is a string', () => {
        expect(typeof SPRITE_VERTEX).toBe('string')
    })


    test('contains version directive', () => {
        expect(SPRITE_VERTEX).toContain('#version 300 es')
    })


    test('declares aPosition attribute', () => {
        expect(SPRITE_VERTEX).toContain('in vec2 aPosition')
    })


    test('declares aTexCoord attribute', () => {
        expect(SPRITE_VERTEX).toContain('in vec2 aTexCoord')
    })


    test('declares aOpacity attribute', () => {
        expect(SPRITE_VERTEX).toContain('in float aOpacity')
    })


    test('declares matrix uniforms', () => {
        expect(SPRITE_VERTEX).toContain('uniform mat3 uProjectionMatrix')
        expect(SPRITE_VERTEX).toContain('uniform mat3 uViewMatrix')
        expect(SPRITE_VERTEX).toContain('uniform mat3 uModelMatrix')
    })

})


describe('SPRITE_FRAGMENT', () => {

    test('is a string', () => {
        expect(typeof SPRITE_FRAGMENT).toBe('string')
    })


    test('contains version directive', () => {
        expect(SPRITE_FRAGMENT).toContain('#version 300 es')
    })


    test('declares uTexture uniform', () => {
        expect(SPRITE_FRAGMENT).toContain('uniform sampler2D uTexture')
    })


    test('declares fragColor output', () => {
        expect(SPRITE_FRAGMENT).toContain('out vec4 fragColor')
    })

})


describe('SPRITE_SHADER_DEF', () => {

    test('has vertex property', () => {
        expect(SPRITE_SHADER_DEF.vertex).toBe(SPRITE_VERTEX)
    })


    test('has fragment property', () => {
        expect(SPRITE_SHADER_DEF.fragment).toBe(SPRITE_FRAGMENT)
    })


    test('has uniforms array', () => {
        expect(SPRITE_SHADER_DEF.uniforms).toEqual([
            'uProjectionMatrix',
            'uViewMatrix',
            'uModelMatrix',
            'uTexture'
        ])
    })


    test('has attributes array', () => {
        expect(SPRITE_SHADER_DEF.attributes).toEqual(['aPosition', 'aTexCoord', 'aOpacity'])
    })

})
