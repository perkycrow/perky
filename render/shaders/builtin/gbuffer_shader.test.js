import {
    GBUFFER_VERTEX,
    GBUFFER_FRAGMENT,
    GBUFFER_SHADER_DEF
} from './gbuffer_shader.js'


describe('GBUFFER_VERTEX', () => {

    test('is a string', () => {
        expect(typeof GBUFFER_VERTEX).toBe('string')
    })

    test('contains version directive', () => {
        expect(GBUFFER_VERTEX).toContain('#version 300 es')
    })

    test('declares aPosition attribute with layout', () => {
        expect(GBUFFER_VERTEX).toContain('layout(location = 0) in vec3 aPosition')
    })

    test('declares aNormal attribute with layout', () => {
        expect(GBUFFER_VERTEX).toContain('layout(location = 1) in vec3 aNormal')
    })

    test('declares aTexCoord attribute with layout', () => {
        expect(GBUFFER_VERTEX).toContain('layout(location = 2) in vec2 aTexCoord')
    })

    test('declares aTangent attribute with layout', () => {
        expect(GBUFFER_VERTEX).toContain('layout(location = 3) in vec3 aTangent')
    })

    test('declares aColor attribute with layout', () => {
        expect(GBUFFER_VERTEX).toContain('layout(location = 4) in vec3 aColor')
    })

    test('computes world position from model matrix', () => {
        expect(GBUFFER_VERTEX).toContain('uModel * vec4(aPosition, 1.0)')
    })

    test('transforms normal with model matrix', () => {
        expect(GBUFFER_VERTEX).toContain('normalMatrix * aNormal')
    })

    test('transforms tangent with model matrix', () => {
        expect(GBUFFER_VERTEX).toContain('normalMatrix * aTangent')
    })

    test('does not declare uLightMatrix', () => {
        expect(GBUFFER_VERTEX).not.toContain('uLightMatrix')
    })

    test('does not output light space position', () => {
        expect(GBUFFER_VERTEX).not.toContain('vLightSpacePosition')
    })

    test('does not output world position', () => {
        expect(GBUFFER_VERTEX).not.toContain('vWorldPosition')
    })

})


describe('GBUFFER_FRAGMENT', () => {

    test('is a string', () => {
        expect(typeof GBUFFER_FRAGMENT).toBe('string')
    })

    test('contains version directive', () => {
        expect(GBUFFER_FRAGMENT).toContain('#version 300 es')
    })

    test('declares 3 MRT outputs', () => {
        expect(GBUFFER_FRAGMENT).toContain('layout(location = 0) out vec4 gAlbedo')
        expect(GBUFFER_FRAGMENT).toContain('layout(location = 1) out vec4 gNormal')
        expect(GBUFFER_FRAGMENT).toContain('layout(location = 2) out vec4 gMaterial')
    })

    test('does not have fragColor output', () => {
        expect(GBUFFER_FRAGMENT).not.toContain('fragColor')
    })

    test('writes albedo with baseColor and opacity', () => {
        expect(GBUFFER_FRAGMENT).toContain('gAlbedo = vec4(baseColor')
    })

    test('encodes normal to 0-1 range', () => {
        expect(GBUFFER_FRAGMENT).toContain('normal * 0.5 + 0.5')
    })

    test('stores unlit flag in normal alpha', () => {
        expect(GBUFFER_FRAGMENT).toContain('gNormal = vec4(normal * 0.5 + 0.5, uUnlit)')
    })

    test('stores roughness and specular in material output', () => {
        expect(GBUFFER_FRAGMENT).toContain('gMaterial = vec4(uRoughness, uSpecular, emissive')
    })

    test('stores emissive as luminance', () => {
        expect(GBUFFER_FRAGMENT).toContain('length(uMaterialEmissive)')
    })

    test('constructs TBN matrix for normal mapping', () => {
        expect(GBUFFER_FRAGMENT).toContain('mat3 TBN = mat3(T, B, normal)')
    })

    test('applies uUVScale to texture coordinates', () => {
        expect(GBUFFER_FRAGMENT).toContain('vTexCoord * uUVScale')
    })

    test('supports vertex colors', () => {
        expect(GBUFFER_FRAGMENT).toContain('uHasVertexColors')
    })

    test('does not contain lighting calculations', () => {
        expect(GBUFFER_FRAGMENT).not.toContain('uLightDirection')
        expect(GBUFFER_FRAGMENT).not.toContain('uAmbientSky')
        expect(GBUFFER_FRAGMENT).not.toContain('uNumLights')
        expect(GBUFFER_FRAGMENT).not.toContain('uShadowMap')
        expect(GBUFFER_FRAGMENT).not.toContain('uCubeShadow')
        expect(GBUFFER_FRAGMENT).not.toContain('acesToneMap')
        expect(GBUFFER_FRAGMENT).not.toContain('uFogNear')
    })

})


describe('GBUFFER_SHADER_DEF', () => {

    test('has vertex property', () => {
        expect(GBUFFER_SHADER_DEF.vertex).toBe(GBUFFER_VERTEX)
    })

    test('has fragment property', () => {
        expect(GBUFFER_SHADER_DEF.fragment).toBe(GBUFFER_FRAGMENT)
    })

    test('has uniforms array', () => {
        expect(GBUFFER_SHADER_DEF.uniforms).toEqual([
            'uProjection',
            'uView',
            'uModel',
            'uTexture',
            'uHasTexture',
            'uUVScale',
            'uMaterialColor',
            'uMaterialEmissive',
            'uMaterialOpacity',
            'uUnlit',
            'uRoughness',
            'uSpecular',
            'uNormalMap',
            'uHasNormalMap',
            'uNormalStrength',
            'uHasVertexColors'
        ])
    })

    test('has same attributes as mesh shader', () => {
        expect(GBUFFER_SHADER_DEF.attributes).toEqual([
            'aPosition',
            'aNormal',
            'aTexCoord',
            'aTangent',
            'aColor'
        ])
    })

    test('does not include lighting uniforms', () => {
        const u = GBUFFER_SHADER_DEF.uniforms
        expect(u).not.toContain('uLightDirection')
        expect(u).not.toContain('uAmbientSky')
        expect(u).not.toContain('uNumLights')
        expect(u).not.toContain('uShadowMap')
        expect(u).not.toContain('uFogNear')
        expect(u).not.toContain('uCameraPosition')
    })

})
