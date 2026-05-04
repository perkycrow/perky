import {doc, section, text, code} from '../../../doc/runtime.js'
import {SSAO_SHADER_DEF, SSAO_BLUR_SHADER_DEF} from './ssao_shader.js'


export default doc('SSAO Shader', {advanced: true}, () => {

    text(`
        Built-in GLSL shaders for Screen-Space Ambient Occlusion. Darkens
        areas where geometry occludes ambient light, adding depth and
        realism to scenes without expensive global illumination.
    `)


    section('SSAO Pass', () => {

        text(`
            Samples depth in a hemisphere around each pixel to estimate
            occlusion. Uses a 16-sample kernel with random rotation to
            reduce banding.

            G-buffer inputs:
            - \`uDepth\` (sampler2D) — depth buffer
            - \`uGNormal\` (sampler2D) — world-space normals

            Camera matrices:
            - \`uProjection\` (mat4) — projection matrix
            - \`uInverseViewProjection\` (mat4) — for world position
            - \`uView\` (mat4) — view matrix

            Parameters:
            - \`uTexelSize\` (vec2) — 1/resolution
            - \`uRadius\` (float) — sampling hemisphere radius
            - \`uBias\` (float) — depth comparison bias
            - \`uIntensity\` (float) — occlusion strength

            The kernel is oriented along the surface normal using a
            per-pixel random rotation derived from screen coordinates.
        `)

        code('SSAO Uniforms', () => {
            const uniforms = SSAO_SHADER_DEF.uniforms
        })

    })


    section('Bilateral Blur Pass', () => {

        text(`
            Smooths the SSAO result with a 5x5 bilateral filter that
            preserves edges based on depth differences.

            Uniforms:
            - \`uSSAOTexture\` (sampler2D) — raw SSAO output
            - \`uDepth\` (sampler2D) — depth buffer for edge detection
            - \`uTexelSize\` (vec2) — 1/resolution

            Depth-aware weighting prevents occlusion from bleeding
            across object boundaries.
        `)

        code('Blur Uniforms', () => {
            const uniforms = SSAO_BLUR_SHADER_DEF.uniforms
        })

    })

})
