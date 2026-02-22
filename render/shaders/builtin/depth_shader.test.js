import {
    DEPTH_VERTEX,
    DEPTH_FRAGMENT,
    DEPTH_SHADER_DEF
} from './depth_shader.js'


describe('DEPTH_VERTEX', () => {

    test('is a string', () => {
        expect(typeof DEPTH_VERTEX).toBe('string')
    })

    test('contains version directive', () => {
        expect(DEPTH_VERTEX).toContain('#version 300 es')
    })

    test('declares aPosition attribute', () => {
        expect(DEPTH_VERTEX).toContain('layout(location = 0) in vec3 aPosition')
    })

    test('declares matrix uniforms', () => {
        expect(DEPTH_VERTEX).toContain('uniform mat4 uProjection')
        expect(DEPTH_VERTEX).toContain('uniform mat4 uView')
        expect(DEPTH_VERTEX).toContain('uniform mat4 uModel')
    })

    test('computes gl_Position', () => {
        expect(DEPTH_VERTEX).toContain('uProjection * uView * uModel')
    })

})


describe('DEPTH_FRAGMENT', () => {

    test('is a string', () => {
        expect(typeof DEPTH_FRAGMENT).toBe('string')
    })

    test('contains version directive', () => {
        expect(DEPTH_FRAGMENT).toContain('#version 300 es')
    })

    test('declares fragColor output', () => {
        expect(DEPTH_FRAGMENT).toContain('out vec4 fragColor')
    })

})


describe('DEPTH_SHADER_DEF', () => {

    test('has vertex property', () => {
        expect(DEPTH_SHADER_DEF.vertex).toBe(DEPTH_VERTEX)
    })

    test('has fragment property', () => {
        expect(DEPTH_SHADER_DEF.fragment).toBe(DEPTH_FRAGMENT)
    })

    test('has uniforms array', () => {
        expect(DEPTH_SHADER_DEF.uniforms).toEqual([
            'uProjection',
            'uView',
            'uModel'
        ])
    })

    test('has attributes array', () => {
        expect(DEPTH_SHADER_DEF.attributes).toEqual(['aPosition'])
    })

})
