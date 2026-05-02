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

    test('declares aPosition attribute with layout', () => {
        expect(MESH_VERTEX).toContain('layout(location = 0) in vec3 aPosition')
    })

    test('declares aNormal attribute with layout', () => {
        expect(MESH_VERTEX).toContain('layout(location = 1) in vec3 aNormal')
    })

    test('declares aTexCoord attribute with layout', () => {
        expect(MESH_VERTEX).toContain('layout(location = 2) in vec2 aTexCoord')
    })

    test('declares aTangent attribute with layout', () => {
        expect(MESH_VERTEX).toContain('layout(location = 3) in vec3 aTangent')
    })

    test('declares aColor attribute with layout', () => {
        expect(MESH_VERTEX).toContain('layout(location = 4) in vec3 aColor')
    })

    test('passes vertex color to fragment', () => {
        expect(MESH_VERTEX).toContain('vColor = aColor')
    })

    test('declares mat4 uniforms', () => {
        expect(MESH_VERTEX).toContain('uniform mat4 uProjection')
        expect(MESH_VERTEX).toContain('uniform mat4 uView')
        expect(MESH_VERTEX).toContain('uniform mat4 uModel')
        expect(MESH_VERTEX).toContain('uniform mat4 uLightMatrix')
    })

    test('computes world position', () => {
        expect(MESH_VERTEX).toContain('uModel * vec4(aPosition, 1.0)')
    })

    test('computes light space position', () => {
        expect(MESH_VERTEX).toContain('vLightSpacePosition = uLightMatrix * worldPos')
    })

    test('transforms normal with model matrix', () => {
        expect(MESH_VERTEX).toContain('normalMatrix * aNormal')
    })

    test('transforms tangent with model matrix', () => {
        expect(MESH_VERTEX).toContain('normalMatrix * aTangent')
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

    test('declares hemisphere ambient uniforms', () => {
        expect(MESH_FRAGMENT).toContain('uniform vec3 uAmbientSky')
        expect(MESH_FRAGMENT).toContain('uniform vec3 uAmbientGround')
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

    test('declares uUVScale uniform', () => {
        expect(MESH_FRAGMENT).toContain('uniform vec2 uUVScale')
    })

    test('declares uRoughness uniform', () => {
        expect(MESH_FRAGMENT).toContain('uniform float uRoughness')
    })

    test('declares uSpecular uniform', () => {
        expect(MESH_FRAGMENT).toContain('uniform float uSpecular')
    })

    test('declares uCameraPosition uniform', () => {
        expect(MESH_FRAGMENT).toContain('uniform vec3 uCameraPosition')
    })

    test('declares normal map uniforms', () => {
        expect(MESH_FRAGMENT).toContain('uniform sampler2D uNormalMap')
        expect(MESH_FRAGMENT).toContain('uniform float uHasNormalMap')
        expect(MESH_FRAGMENT).toContain('uniform float uNormalStrength')
    })

    test('declares shadow map uniforms', () => {
        expect(MESH_FRAGMENT).toContain('uniform highp sampler2DShadow uShadowMap')
        expect(MESH_FRAGMENT).toContain('uniform float uHasShadowMap')
    })

    test('contains calcShadow function with PCF', () => {
        expect(MESH_FRAGMENT).toContain('float calcShadow')
        expect(MESH_FRAGMENT).toContain('shadow / 25.0')
    })

    test('constructs TBN matrix for normal mapping', () => {
        expect(MESH_FRAGMENT).toContain('mat3 TBN = mat3(T, B, normal)')
    })

    test('applies uUVScale to texture coordinates', () => {
        expect(MESH_FRAGMENT).toContain('vTexCoord * uUVScale')
    })

    test('contains Blinn-Phong half vector', () => {
        expect(MESH_FRAGMENT).toContain('halfDir')
        expect(MESH_FRAGMENT).toContain('halfVec')
    })

    test('declares light data texture uniform', () => {
        expect(MESH_FRAGMENT).toContain('uniform int uNumLights')
        expect(MESH_FRAGMENT).toContain('uniform highp sampler2D uLightData')
    })

    test('reads lights with texelFetch', () => {
        expect(MESH_FRAGMENT).toContain('texelFetch(uLightData, ivec2(0, i), 0)')
        expect(MESH_FRAGMENT).toContain('texelFetch(uLightData, ivec2(1, i), 0)')
        expect(MESH_FRAGMENT).toContain('texelFetch(uLightData, ivec2(2, i), 0)')
        expect(MESH_FRAGMENT).toContain('texelFetch(uLightData, ivec2(3, i), 0)')
    })


    test('contains spotlight cone calculation', () => {
        expect(MESH_FRAGMENT).toContain('spotDir.w > -1.0')
        expect(MESH_FRAGMENT).toContain('dot(-lightDir, normalize(spotDir.xyz))')
    })

    test('loops over uNumLights directly', () => {
        expect(MESH_FRAGMENT).toContain('for (int i = 0; i < uNumLights; i++)')
    })

    test('declares fragColor output', () => {
        expect(MESH_FRAGMENT).toContain('out vec4 fragColor')
    })

    test('declares uHasVertexColors uniform', () => {
        expect(MESH_FRAGMENT).toContain('uniform float uHasVertexColors')
    })

    test('multiplies baseColor by vertex color', () => {
        expect(MESH_FRAGMENT).toContain('uMaterialColor * vertexColor')
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
            'uAmbientSky',
            'uAmbientGround',
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
            'uLightData',
            'uUVScale',
            'uRoughness',
            'uSpecular',
            'uCameraPosition',
            'uNormalMap',
            'uHasNormalMap',
            'uNormalStrength',
            'uLightMatrix',
            'uShadowMap',
            'uHasShadowMap',
            'uCubeShadowMap',
            'uHasCubeShadowMap',
            'uCubeShadowLightPos',
            'uCubeShadowFar',
            'uCubeShadowLightIdx',
            'uHasVertexColors'
        ])
    })

    test('has attributes array', () => {
        expect(MESH_SHADER_DEF.attributes).toEqual([
            'aPosition',
            'aNormal',
            'aTexCoord',
            'aTangent',
            'aColor'
        ])
    })

})
