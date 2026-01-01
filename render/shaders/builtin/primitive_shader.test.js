import {describe, test, expect} from 'vitest'
import {
    PRIMITIVE_VERTEX,
    PRIMITIVE_FRAGMENT,
    PRIMITIVE_SHADER_DEF
} from './primitive_shader.js'


describe('PRIMITIVE_VERTEX', () => {

    test('is a string', () => {
        expect(typeof PRIMITIVE_VERTEX).toBe('string')
    })


    test('contains version directive', () => {
        expect(PRIMITIVE_VERTEX).toContain('#version 300 es')
    })


    test('declares aPosition attribute', () => {
        expect(PRIMITIVE_VERTEX).toContain('in vec2 aPosition')
    })


    test('declares aColor attribute', () => {
        expect(PRIMITIVE_VERTEX).toContain('in vec4 aColor')
    })


    test('declares uProjectionMatrix uniform', () => {
        expect(PRIMITIVE_VERTEX).toContain('uniform mat3 uProjectionMatrix')
    })


    test('declares uViewMatrix uniform', () => {
        expect(PRIMITIVE_VERTEX).toContain('uniform mat3 uViewMatrix')
    })

})


describe('PRIMITIVE_FRAGMENT', () => {

    test('is a string', () => {
        expect(typeof PRIMITIVE_FRAGMENT).toBe('string')
    })


    test('contains version directive', () => {
        expect(PRIMITIVE_FRAGMENT).toContain('#version 300 es')
    })


    test('declares fragColor output', () => {
        expect(PRIMITIVE_FRAGMENT).toContain('out vec4 fragColor')
    })

})


describe('PRIMITIVE_SHADER_DEF', () => {

    test('has vertex property', () => {
        expect(PRIMITIVE_SHADER_DEF.vertex).toBe(PRIMITIVE_VERTEX)
    })


    test('has fragment property', () => {
        expect(PRIMITIVE_SHADER_DEF.fragment).toBe(PRIMITIVE_FRAGMENT)
    })


    test('has uniforms array', () => {
        expect(PRIMITIVE_SHADER_DEF.uniforms).toEqual(['uProjectionMatrix', 'uViewMatrix'])
    })


    test('has attributes array', () => {
        expect(PRIMITIVE_SHADER_DEF.attributes).toEqual(['aPosition', 'aColor'])
    })

})
