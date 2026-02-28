import {
    WIRE_VERTEX,
    WIRE_FRAGMENT,
    WIRE_SHADER_DEF
} from './wire_shader.js'


describe('WIRE_VERTEX', () => {

    test('is a string', () => {
        expect(typeof WIRE_VERTEX).toBe('string')
    })

    test('contains version directive', () => {
        expect(WIRE_VERTEX).toContain('#version 300 es')
    })

    test('declares aPosition attribute with layout', () => {
        expect(WIRE_VERTEX).toContain('layout(location = 0) in vec3 aPosition')
    })

    test('declares projection and view uniforms', () => {
        expect(WIRE_VERTEX).toContain('uniform mat4 uProjection')
        expect(WIRE_VERTEX).toContain('uniform mat4 uView')
    })

    test('computes gl_Position from projection view and position', () => {
        expect(WIRE_VERTEX).toContain('uProjection * uView * vec4(aPosition, 1.0)')
    })

})


describe('WIRE_FRAGMENT', () => {

    test('is a string', () => {
        expect(typeof WIRE_FRAGMENT).toBe('string')
    })

    test('contains version directive', () => {
        expect(WIRE_FRAGMENT).toContain('#version 300 es')
    })

    test('declares uColor uniform', () => {
        expect(WIRE_FRAGMENT).toContain('uniform vec3 uColor')
    })

    test('declares uOpacity uniform', () => {
        expect(WIRE_FRAGMENT).toContain('uniform float uOpacity')
    })

    test('declares fragColor output', () => {
        expect(WIRE_FRAGMENT).toContain('out vec4 fragColor')
    })

})


describe('WIRE_SHADER_DEF', () => {

    test('has vertex property', () => {
        expect(WIRE_SHADER_DEF.vertex).toBe(WIRE_VERTEX)
    })

    test('has fragment property', () => {
        expect(WIRE_SHADER_DEF.fragment).toBe(WIRE_FRAGMENT)
    })

    test('has uniforms array', () => {
        expect(WIRE_SHADER_DEF.uniforms).toEqual([
            'uProjection',
            'uView',
            'uColor',
            'uOpacity'
        ])
    })

    test('has attributes array', () => {
        expect(WIRE_SHADER_DEF.attributes).toEqual(['aPosition'])
    })

})
