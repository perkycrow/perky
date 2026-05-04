import {doc, section, text, code} from '../../../doc/runtime.js'
import {VOLUMETRIC_FOG_SHADER_DEF, FOG_BLUR_SHADER_DEF} from './volumetric_fog_shader.js'


export default doc('Volumetric Fog Shader', {advanced: true}, () => {

    text(`
        Built-in GLSL shaders for screen-space volumetric fog with
        light scattering. Ray-marches through the scene accumulating
        fog density and in-scattered light from point lights.
    `)


    section('Volumetric Fog Pass', () => {

        text(`
            Ray-marches from camera toward each pixel, sampling fog density
            and accumulating scattered light. Height-based falloff creates
            ground fog, and animated noise adds organic variation.

            Scene inputs:
            - \`uDepth\` (sampler2D) — depth buffer
            - \`uLightData\` (sampler2D) — packed point light data
            - \`uInverseViewProjection\` (mat4) — for world position
            - \`uCameraPosition\` (vec3) — camera world position
            - \`uNumLights\` (int) — active point light count
            - \`uTime\` (float) — animation time

            Fog parameters:
            - \`uFogDensity\` (float) — base fog density
            - \`uFogHeightFalloff\` (float) — exponential height decay
            - \`uFogBaseHeight\` (float) — ground level
            - \`uFogNoiseScale\` (float) — noise frequency
            - \`uFogNoiseStrength\` (float) — noise influence
            - \`uFogWindDirection\` (vec2) — XZ wind direction
            - \`uFogWindSpeed\` (float) — wind animation speed
            - \`uFogColor\` (vec3) — ambient fog color

            Ray-march parameters:
            - \`uFogSteps\` (int) — number of samples (max 64)
            - \`uFogMaxDistance\` (float) — maximum ray distance
            - \`uFogStartDistance\` (float) — fade-in distance
            - \`uFogScatterAnisotropy\` (float) — Henyey-Greenstein g value

            Light scattering uses Henyey-Greenstein phase function.
            Positive anisotropy scatters forward (sun shafts),
            negative scatters backward (halo effects).
        `)

        code('Fog Uniforms', () => {
            const uniforms = VOLUMETRIC_FOG_SHADER_DEF.uniforms
        })

    })


    section('Fog Blur & Composite Pass', () => {

        text(`
            Blurs the fog result with a depth-aware bilateral filter
            and composites over the scene color.

            Uniforms:
            - \`uFogTexture\` (sampler2D) — raw volumetric fog (RGB + transmittance)
            - \`uSceneColor\` (sampler2D) — rendered scene
            - \`uDepth\` (sampler2D) — depth buffer for edge detection
            - \`uTexelSize\` (vec2) — 1/resolution

            Composites using: result = scene × transmittance + fogColor
        `)

        code('Blur Uniforms', () => {
            const uniforms = FOG_BLUR_SHADER_DEF.uniforms
        })

    })

})
