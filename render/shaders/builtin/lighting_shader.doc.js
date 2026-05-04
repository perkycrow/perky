import {doc, section, text, code} from '../../../doc/runtime.js'
import {LIGHTING_SHADER_DEF} from './lighting_shader.js'


export default doc('Lighting Shader', {advanced: true}, () => {

    text(`
        Built-in GLSL shader for deferred rendering's lighting pass.
        Reads from G-buffer textures and computes full lighting with
        directional light, point/spot lights, shadows, SSAO, and fog.
    `)


    section('Vertex Shader', () => {

        text(`
            Fullscreen quad pass-through. Outputs texture coordinates
            for sampling the G-buffer.

            Attributes:
            - \`aPosition\` (vec2) — clip-space position
            - \`aTexCoord\` (vec2) — texture UV coordinates
        `)

    })


    section('Fragment Shader', () => {

        text(`
            Reconstructs world position from depth, computes lighting
            from all sources, applies shadows and fog, then outputs
            final color with ACES tone mapping.

            G-buffer inputs:
            - \`uAlbedo\` — albedo/color from geometry pass
            - \`uGNormal\` — world normals (RGB) and unlit flag (A)
            - \`uMaterial\` — roughness (R), specular (G), emissive (B)
            - \`uDepth\` — depth buffer for position reconstruction

            Camera:
            - \`uInverseViewProjection\` (mat4) — for world position
            - \`uCameraPosition\` (vec3) — for specular and fog

            Directional light:
            - \`uLightDirection\` (vec3) — sun direction
            - \`uDirectionalIntensity\` (float) — sun intensity
            - \`uAmbientSky\` (vec3) — sky ambient color
            - \`uAmbientGround\` (vec3) — ground ambient color

            Point/spot lights:
            - \`uNumLights\` (int) — active light count
            - \`uLightData\` (sampler2D) — packed light data texture
            - \`uLightBlobiness\` (float) — noise-based light variation

            Directional shadows:
            - \`uShadowMap\` (sampler2DShadow) — shadow depth map
            - \`uHasShadowMap\` (float) — 1.0 if enabled
            - \`uLightMatrix\` (mat4) — light projection

            Point shadows (up to 5 cube maps):
            - \`uCubeShadow0-4\` (samplerCube) — cube shadow maps
            - \`uCubeShadowPos0-4\` (vec3) — light positions
            - \`uCubeShadowFar0-4\` (float) — far plane distances
            - \`uNumCubeShadows\` (int) — active cube shadow count
            - \`uShadowSoftness\` (float) — PCSS softness

            Stylization:
            - \`uToonLevels\` (float) — toon shading bands (0 = off)
            - \`uToonBlend\` (float) — blend with smooth shading
            - \`uRimPower\`, \`uRimIntensity\`, \`uRimColor\` — rim lighting

            Post effects:
            - \`uSSAO\` (sampler2D) — ambient occlusion texture
            - \`uHasSSAO\` (float) — 1.0 if SSAO enabled
            - \`uFogNear\`, \`uFogFar\` (float) — fog distance range
            - \`uFogColor\` (vec3) — fog color
            - \`uVolumetricFogEnabled\` (float) — skip simple fog if volumetric
        `)

    })


    section('Shader Definition', () => {

        text(`
            \`LIGHTING_SHADER_DEF\` bundles vertex source, fragment source,
            uniform names, and attribute names.
        `)

        code('Uniforms', () => {
            const uniforms = LIGHTING_SHADER_DEF.uniforms
        })

    })

})
