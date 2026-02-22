import {
    MESH_VERTEX,
    MESH_FRAGMENT,
    MESH_SHADER_DEF
} from './mesh_shader.js'


describe('MESH_VERTEX', () => {

    test('is a string', () => {
        expect(typeof MESH_VERTEX).toBe('string')
    })

    test('contains version directive', () => {
        expect(MESH_VERTEX).toContain('#version 300 es')
    })

    test('declares aPosition attribute', () => {
        expect(MESH_VERTEX).toContain('in vec3 aPosition')
    })

    test('declares aNormal attribute', () => {
        expect(MESH_VERTEX).toContain('in vec3 aNormal')
    })

    test('declares aTexCoord attribute', () => {
        expect(MESH_VERTEX).toContain('in vec2 aTexCoord')
    })

    test('declares mat4 uniforms', () => {
        expect(MESH_VERTEX).toContain('uniform mat4 uProjection')
        expect(MESH_VERTEX).toContain('uniform mat4 uView')
        expect(MESH_VERTEX).toContain('uniform mat4 uModel')
    })

    test('computes world position', () => {
        expect(MESH_VERTEX).toContain('uModel * vec4(aPosition, 1.0)')
    })

    test('transforms normal with model matrix', () => {
        expect(MESH_VERTEX).toContain('mat3(uModel) * aNormal')
    })

})


describe('MESH_FRAGMENT', () => {

    test('is a string', () => {
        expect(typeof MESH_FRAGMENT).toBe('string')
    })

    test('contains version directive', () => {
        expect(MESH_FRAGMENT).toContain('#version 300 es')
    })

    test('declares uTexture uniform', () => {
        expect(MESH_FRAGMENT).toContain('uniform sampler2D uTexture')
    })

    test('declares uLightDirection uniform', () => {
        expect(MESH_FRAGMENT).toContain('uniform vec3 uLightDirection')
    })

    test('declares uAmbient uniform', () => {
        expect(MESH_FRAGMENT).toContain('uniform float uAmbient')
    })

    test('declares fog uniforms', () => {
        expect(MESH_FRAGMENT).toContain('uniform float uFogNear')
        expect(MESH_FRAGMENT).toContain('uniform float uFogFar')
        expect(MESH_FRAGMENT).toContain('uniform vec3 uFogColor')
    })

    test('declares material uniforms', () => {
        expect(MESH_FRAGMENT).toContain('uniform vec3 uMaterialColor')
        expect(MESH_FRAGMENT).toContain('uniform vec3 uMaterialEmissive')
        expect(MESH_FRAGMENT).toContain('uniform float uMaterialOpacity')
        expect(MESH_FRAGMENT).toContain('uniform float uUnlit')
        expect(MESH_FRAGMENT).toContain('uniform float uHasTexture')
    })

    test('declares light uniforms', () => {
        expect(MESH_FRAGMENT).toContain('uniform int uNumLights')
        expect(MESH_FRAGMENT).toContain('uniform vec3 uLightPositions[MAX_LIGHTS]')
        expect(MESH_FRAGMENT).toContain('uniform vec3 uLightColors[MAX_LIGHTS]')
        expect(MESH_FRAGMENT).toContain('uniform float uLightIntensities[MAX_LIGHTS]')
        expect(MESH_FRAGMENT).toContain('uniform float uLightRadii[MAX_LIGHTS]')
    })

    test('contains point light loop', () => {
        expect(MESH_FRAGMENT).toContain('for (int i = 0; i < MAX_LIGHTS; i++)')
    })

    test('declares fragColor output', () => {
        expect(MESH_FRAGMENT).toContain('out vec4 fragColor')
    })

})


describe('MESH_SHADER_DEF', () => {

    test('has vertex property', () => {
        expect(MESH_SHADER_DEF.vertex).toBe(MESH_VERTEX)
    })

    test('has fragment property', () => {
        expect(MESH_SHADER_DEF.fragment).toBe(MESH_FRAGMENT)
    })

    test('has uniforms array', () => {
        expect(MESH_SHADER_DEF.uniforms).toEqual([
            'uProjection',
            'uView',
            'uModel',
            'uTexture',
            'uLightDirection',
            'uAmbient',
            'uTintColor',
            'uFogNear',
            'uFogFar',
            'uFogColor',
            'uMaterialColor',
            'uMaterialEmissive',
            'uMaterialOpacity',
            'uUnlit',
            'uHasTexture',
            'uNumLights',
            'uLightPositions',
            'uLightColors',
            'uLightIntensities',
            'uLightRadii'
        ])
    })

    test('has attributes array', () => {
        expect(MESH_SHADER_DEF.attributes).toEqual([
            'aPosition',
            'aNormal',
            'aTexCoord'
        ])
    })

})
