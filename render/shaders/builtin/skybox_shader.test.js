import {
    SKYBOX_VERTEX,
    SKYBOX_FRAGMENT,
    SKYBOX_SHADER_DEF
} from './skybox_shader.js'


describe('SKYBOX_VERTEX', () => {

    test('is a string', () => {
        expect(typeof SKYBOX_VERTEX).toBe('string')
    })


    test('contains version directive', () => {
        expect(SKYBOX_VERTEX).toContain('#version 300 es')
    })


    test('declares aPosition attribute', () => {
        expect(SKYBOX_VERTEX).toContain('layout(location = 0) in vec3 aPosition')
    })


    test('declares projection and view rotation uniforms', () => {
        expect(SKYBOX_VERTEX).toContain('uniform mat4 uProjection')
        expect(SKYBOX_VERTEX).toContain('uniform mat4 uViewRotation')
    })


    test('outputs direction as position', () => {
        expect(SKYBOX_VERTEX).toContain('vDirection = aPosition')
    })


    test('uses xyww trick for far plane depth', () => {
        expect(SKYBOX_VERTEX).toContain('pos.xyww')
    })

})


describe('SKYBOX_FRAGMENT', () => {

    test('is a string', () => {
        expect(typeof SKYBOX_FRAGMENT).toBe('string')
    })


    test('contains version directive', () => {
        expect(SKYBOX_FRAGMENT).toContain('#version 300 es')
    })


    test('declares sky gradient uniforms', () => {
        expect(SKYBOX_FRAGMENT).toContain('uniform vec3 uSkyColor')
        expect(SKYBOX_FRAGMENT).toContain('uniform vec3 uHorizonColor')
        expect(SKYBOX_FRAGMENT).toContain('uniform vec3 uGroundColor')
    })


    test('declares cubemap uniforms', () => {
        expect(SKYBOX_FRAGMENT).toContain('uniform float uHasCubemap')
        expect(SKYBOX_FRAGMENT).toContain('uniform samplerCube uCubemap')
    })


    test('normalizes direction for sampling', () => {
        expect(SKYBOX_FRAGMENT).toContain('normalize(vDirection)')
    })


    test('declares fragColor output', () => {
        expect(SKYBOX_FRAGMENT).toContain('out vec4 fragColor')
    })

})


describe('SKYBOX_SHADER_DEF', () => {

    test('has vertex property', () => {
        expect(SKYBOX_SHADER_DEF.vertex).toBe(SKYBOX_VERTEX)
    })


    test('has fragment property', () => {
        expect(SKYBOX_SHADER_DEF.fragment).toBe(SKYBOX_FRAGMENT)
    })


    test('has uniforms array', () => {
        expect(SKYBOX_SHADER_DEF.uniforms).toEqual([
            'uProjection',
            'uViewRotation',
            'uSkyColor',
            'uHorizonColor',
            'uGroundColor',
            'uHasCubemap',
            'uCubemap'
        ])
    })


    test('has attributes array', () => {
        expect(SKYBOX_SHADER_DEF.attributes).toEqual(['aPosition'])
    })

})
