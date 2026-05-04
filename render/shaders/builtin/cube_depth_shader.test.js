import {describe, test, expect} from 'vitest'
import {
    CUBE_DEPTH_VERTEX,
    CUBE_DEPTH_FRAGMENT,
    CUBE_DEPTH_SHADER_DEF
} from './cube_depth_shader.js'


describe('CUBE_DEPTH_VERTEX', () => {

    test('is a string', () => {
        expect(typeof CUBE_DEPTH_VERTEX).toBe('string')
    })


    test('contains version directive', () => {
        expect(CUBE_DEPTH_VERTEX).toContain('#version 300 es')
    })


    test('declares aPosition attribute', () => {
        expect(CUBE_DEPTH_VERTEX).toContain('in vec3 aPosition')
    })


    test('declares matrix uniforms', () => {
        expect(CUBE_DEPTH_VERTEX).toContain('uniform mat4 uProjection')
        expect(CUBE_DEPTH_VERTEX).toContain('uniform mat4 uView')
        expect(CUBE_DEPTH_VERTEX).toContain('uniform mat4 uModel')
    })


    test('declares vWorldPosition output', () => {
        expect(CUBE_DEPTH_VERTEX).toContain('out vec3 vWorldPosition')
    })

})


describe('CUBE_DEPTH_FRAGMENT', () => {

    test('is a string', () => {
        expect(typeof CUBE_DEPTH_FRAGMENT).toBe('string')
    })


    test('contains version directive', () => {
        expect(CUBE_DEPTH_FRAGMENT).toContain('#version 300 es')
    })


    test('declares uLightPosition uniform', () => {
        expect(CUBE_DEPTH_FRAGMENT).toContain('uniform vec3 uLightPosition')
    })


    test('declares uFar uniform', () => {
        expect(CUBE_DEPTH_FRAGMENT).toContain('uniform float uFar')
    })


    test('declares fragColor output', () => {
        expect(CUBE_DEPTH_FRAGMENT).toContain('out float fragColor')
    })

})


describe('CUBE_DEPTH_SHADER_DEF', () => {

    test('has vertex property', () => {
        expect(CUBE_DEPTH_SHADER_DEF.vertex).toBe(CUBE_DEPTH_VERTEX)
    })


    test('has fragment property', () => {
        expect(CUBE_DEPTH_SHADER_DEF.fragment).toBe(CUBE_DEPTH_FRAGMENT)
    })


    test('has uniforms array', () => {
        expect(CUBE_DEPTH_SHADER_DEF.uniforms).toEqual([
            'uProjection',
            'uView',
            'uModel',
            'uLightPosition',
            'uFar'
        ])
    })


    test('has attributes array', () => {
        expect(CUBE_DEPTH_SHADER_DEF.attributes).toEqual(['aPosition'])
    })

})
