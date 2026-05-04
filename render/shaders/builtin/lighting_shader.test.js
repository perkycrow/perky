import {
    LIGHTING_VERTEX,
    LIGHTING_FRAGMENT,
    LIGHTING_SHADER_DEF
} from './lighting_shader.js'


describe('LIGHTING_VERTEX', () => {

    test('is a string', () => {
        expect(typeof LIGHTING_VERTEX).toBe('string')
    })

    test('contains version directive', () => {
        expect(LIGHTING_VERTEX).toContain('#version 300 es')
    })

    test('declares vec2 aPosition for fullscreen quad', () => {
        expect(LIGHTING_VERTEX).toContain('layout(location = 0) in vec2 aPosition')
    })

    test('declares vec2 aTexCoord', () => {
        expect(LIGHTING_VERTEX).toContain('layout(location = 1) in vec2 aTexCoord')
    })

    test('passes texcoord to fragment', () => {
        expect(LIGHTING_VERTEX).toContain('vTexCoord = aTexCoord')
    })

    test('does not use model/view/projection matrices', () => {
        expect(LIGHTING_VERTEX).not.toContain('uModel')
        expect(LIGHTING_VERTEX).not.toContain('uView')
        expect(LIGHTING_VERTEX).not.toContain('uProjection')
    })

})


describe('LIGHTING_FRAGMENT', () => {

    test('is a string', () => {
        expect(typeof LIGHTING_FRAGMENT).toBe('string')
    })

    test('contains version directive', () => {
        expect(LIGHTING_FRAGMENT).toContain('#version 300 es')
    })

    test('declares G-buffer sampler uniforms', () => {
        expect(LIGHTING_FRAGMENT).toContain('uniform sampler2D uAlbedo')
        expect(LIGHTING_FRAGMENT).toContain('uniform sampler2D uGNormal')
        expect(LIGHTING_FRAGMENT).toContain('uniform sampler2D uMaterial')
        expect(LIGHTING_FRAGMENT).toContain('uniform highp sampler2D uDepth')
    })

    test('declares inverse view projection uniform', () => {
        expect(LIGHTING_FRAGMENT).toContain('uniform mat4 uInverseViewProjection')
    })

    test('reconstructs world position from depth', () => {
        expect(LIGHTING_FRAGMENT).toContain('reconstructWorldPosition')
        expect(LIGHTING_FRAGMENT).toContain('uInverseViewProjection * ndc')
        expect(LIGHTING_FRAGMENT).toContain('world.xyz / world.w')
    })

    test('decodes normal from 0-1 range', () => {
        expect(LIGHTING_FRAGMENT).toContain('normalSample.rgb * 2.0 - 1.0')
    })

    test('reads unlit flag from normal alpha', () => {
        expect(LIGHTING_FRAGMENT).toContain('float unlit = normalSample.a')
    })

    test('reads roughness and specular from material texture', () => {
        expect(LIGHTING_FRAGMENT).toContain('float roughness = materialSample.r')
        expect(LIGHTING_FRAGMENT).toContain('float specular = materialSample.g')
        expect(LIGHTING_FRAGMENT).toContain('float emissive = materialSample.b')
    })

    test('computes directional shadow from world position', () => {
        expect(LIGHTING_FRAGMENT).toContain('uLightMatrix * vec4(worldPos, 1.0)')
    })

    test('contains PCF 5x5 shadow filtering', () => {
        expect(LIGHTING_FRAGMENT).toContain('shadow / 25.0')
    })

    test('contains hemisphere ambient lighting', () => {
        expect(LIGHTING_FRAGMENT).toContain('mix(uAmbientGround, uAmbientSky, hemiFactor)')
    })

    test('contains point light loop with texelFetch', () => {
        expect(LIGHTING_FRAGMENT).toContain('for (int i = 0; i < uNumLights; i++)')
        expect(LIGHTING_FRAGMENT).toContain('texelFetch(uLightData, ivec2(0, i), 0)')
    })

    test('contains spotlight cone calculation', () => {
        expect(LIGHTING_FRAGMENT).toContain('spotDir.w > -1.0')
    })

    test('contains cubemap shadow sampling', () => {
        expect(LIGHTING_FRAGMENT).toContain('calcCubeShadowSample')
        expect(LIGHTING_FRAGMENT).toContain('calcPointShadow')
    })

    test('cubemap shadow functions take worldPos parameter', () => {
        expect(LIGHTING_FRAGMENT).toContain('calcCubeShadowSample (mediump samplerCube smap, vec3 lightPos, float far, vec3 worldPos, vec3 normal)')
        expect(LIGHTING_FRAGMENT).toContain('calcPointShadow (vec3 lightPos, vec3 worldPos, vec3 normal)')
    })

    test('contains ACES tonemapping', () => {
        expect(LIGHTING_FRAGMENT).toContain('acesToneMap')
    })

    test('contains fog calculation', () => {
        expect(LIGHTING_FRAGMENT).toContain('uFogNear')
        expect(LIGHTING_FRAGMENT).toContain('uFogFar')
        expect(LIGHTING_FRAGMENT).toContain('uFogColor')
    })

    test('contains dithering', () => {
        expect(LIGHTING_FRAGMENT).toContain('0.06711056')
    })

    test('adds emissive based on albedo', () => {
        expect(LIGHTING_FRAGMENT).toContain('baseColor * emissive')
    })

    test('discards empty pixels', () => {
        expect(LIGHTING_FRAGMENT).toContain('albedoSample.a < 0.001')
        expect(LIGHTING_FRAGMENT).toContain('discard')
    })

    test('writes depth to gl_FragDepth', () => {
        expect(LIGHTING_FRAGMENT).toContain('gl_FragDepth = depth')
    })

    test('contains Lambertian normalization', () => {
        expect(LIGHTING_FRAGMENT).toContain('/ 3.14159')
    })

    test('contains Fresnel', () => {
        expect(LIGHTING_FRAGMENT).toContain('fresnel')
    })

    test('contains energy-conserving specular normalization', () => {
        expect(LIGHTING_FRAGMENT).toContain('(shininess + 2.0) / 25.0')
    })

    test('contains toon shading with toonify function', () => {
        expect(LIGHTING_FRAGMENT).toContain('float toonify')
        expect(LIGHTING_FRAGMENT).toContain('uToonLevels')
        expect(LIGHTING_FRAGMENT).toContain('uToonBlend')
    })

    test('contains rim lighting', () => {
        expect(LIGHTING_FRAGMENT).toContain('uRimPower')
        expect(LIGHTING_FRAGMENT).toContain('uRimIntensity')
        expect(LIGHTING_FRAGMENT).toContain('uRimColor')
    })

    test('contains SSAO sampling', () => {
        expect(LIGHTING_FRAGMENT).toContain('uniform sampler2D uSSAO')
        expect(LIGHTING_FRAGMENT).toContain('uHasSSAO')
    })

    test('contains volumetric fog toggle', () => {
        expect(LIGHTING_FRAGMENT).toContain('uVolumetricFogEnabled')
    })

    test('contains light blobiness noise', () => {
        expect(LIGHTING_FRAGMENT).toContain('uLightBlobiness')
        expect(LIGHTING_FRAGMENT).toContain('lightNoise')
    })

    test('contains shadow softness for PCSS', () => {
        expect(LIGHTING_FRAGMENT).toContain('uShadowSoftness')
    })

    test('contains double-sided lighting support', () => {
        expect(LIGHTING_FRAGMENT).toContain('float doubleSided = materialSample.a')
        expect(LIGHTING_FRAGMENT).toContain('faceforward')
    })

})


describe('LIGHTING_SHADER_DEF', () => {

    test('has vertex property', () => {
        expect(LIGHTING_SHADER_DEF.vertex).toBe(LIGHTING_VERTEX)
    })

    test('has fragment property', () => {
        expect(LIGHTING_SHADER_DEF.fragment).toBe(LIGHTING_FRAGMENT)
    })

    test('has G-buffer uniforms', () => {
        const u = LIGHTING_SHADER_DEF.uniforms
        expect(u).toContain('uAlbedo')
        expect(u).toContain('uGNormal')
        expect(u).toContain('uMaterial')
        expect(u).toContain('uDepth')
    })

    test('has inverse view projection uniform', () => {
        expect(LIGHTING_SHADER_DEF.uniforms).toContain('uInverseViewProjection')
    })

    test('has lighting uniforms', () => {
        const u = LIGHTING_SHADER_DEF.uniforms
        expect(u).toContain('uLightDirection')
        expect(u).toContain('uAmbientSky')
        expect(u).toContain('uAmbientGround')
        expect(u).toContain('uNumLights')
        expect(u).toContain('uLightData')
    })

    test('has shadow uniforms', () => {
        const u = LIGHTING_SHADER_DEF.uniforms
        expect(u).toContain('uShadowMap')
        expect(u).toContain('uHasShadowMap')
        expect(u).toContain('uLightMatrix')
        expect(u).toContain('uCubeShadow0')
        expect(u).toContain('uNumCubeShadows')
        expect(u).toContain('uShadowSoftness')
    })

    test('has toon shading uniforms', () => {
        const u = LIGHTING_SHADER_DEF.uniforms
        expect(u).toContain('uToonLevels')
        expect(u).toContain('uToonBlend')
    })

    test('has rim lighting uniforms', () => {
        const u = LIGHTING_SHADER_DEF.uniforms
        expect(u).toContain('uRimPower')
        expect(u).toContain('uRimIntensity')
        expect(u).toContain('uRimColor')
    })

    test('has SSAO uniforms', () => {
        const u = LIGHTING_SHADER_DEF.uniforms
        expect(u).toContain('uSSAO')
        expect(u).toContain('uHasSSAO')
    })

    test('has directional light uniforms', () => {
        const u = LIGHTING_SHADER_DEF.uniforms
        expect(u).toContain('uDirectionalIntensity')
        expect(u).toContain('uCameraPosition')
    })

    test('has effect uniforms', () => {
        const u = LIGHTING_SHADER_DEF.uniforms
        expect(u).toContain('uLightBlobiness')
        expect(u).toContain('uVolumetricFogEnabled')
    })

    test('has fullscreen quad attributes', () => {
        expect(LIGHTING_SHADER_DEF.attributes).toEqual(['aPosition', 'aTexCoord'])
    })

    test('does not include per-object uniforms', () => {
        const u = LIGHTING_SHADER_DEF.uniforms
        expect(u).not.toContain('uModel')
        expect(u).not.toContain('uTexture')
        expect(u).not.toContain('uMaterialColor')
        expect(u).not.toContain('uRoughness')
        expect(u).not.toContain('uHasTexture')
    })

})
