import {describe, test, expect} from 'vitest'
import {
    COMPOSITE_VERTEX,
    COMPOSITE_FRAGMENT,
    COMPOSITE_SHADER_DEF
} from './composite_shader.js'


describe('COMPOSITE_VERTEX', () => {

    test('is a string', () => {
        expect(typeof COMPOSITE_VERTEX).toBe('string')
    })


    test('contains version directive', () => {
        expect(COMPOSITE_VERTEX).toContain('#version 300 es')
    })


    test('declares aPosition attribute', () => {
        expect(COMPOSITE_VERTEX).toContain('in vec2 aPosition')
    })


    test('declares aTexCoord attribute', () => {
        expect(COMPOSITE_VERTEX).toContain('in vec2 aTexCoord')
    })


    test('outputs vTexCoord', () => {
        expect(COMPOSITE_VERTEX).toContain('out vec2 vTexCoord')
    })

})


describe('COMPOSITE_FRAGMENT', () => {

    test('is a string', () => {
        expect(typeof COMPOSITE_FRAGMENT).toBe('string')
    })


    test('contains version directive', () => {
        expect(COMPOSITE_FRAGMENT).toContain('#version 300 es')
    })


    test('declares uTexture uniform', () => {
        expect(COMPOSITE_FRAGMENT).toContain('uniform sampler2D uTexture')
    })


    test('declares uOpacity uniform', () => {
        expect(COMPOSITE_FRAGMENT).toContain('uniform float uOpacity')
    })


    test('declares fragColor output', () => {
        expect(COMPOSITE_FRAGMENT).toContain('out vec4 fragColor')
    })

})


describe('COMPOSITE_SHADER_DEF', () => {

    test('has vertex property', () => {
        expect(COMPOSITE_SHADER_DEF.vertex).toBe(COMPOSITE_VERTEX)
    })


    test('has fragment property', () => {
        expect(COMPOSITE_SHADER_DEF.fragment).toBe(COMPOSITE_FRAGMENT)
    })


    test('has uniforms array', () => {
        expect(COMPOSITE_SHADER_DEF.uniforms).toEqual(['uTexture', 'uOpacity'])
    })


    test('has attributes array', () => {
        expect(COMPOSITE_SHADER_DEF.attributes).toEqual(['aPosition', 'aTexCoord'])
    })

})
