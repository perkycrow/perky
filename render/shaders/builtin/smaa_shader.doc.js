import {doc, section, text, code} from '../../../doc/runtime.js'
import {SMAA_EDGE_SHADER_DEF, SMAA_WEIGHT_SHADER_DEF, SMAA_BLEND_SHADER_DEF} from './smaa_shader.js'


export default doc('SMAA Shader', {advanced: true}, () => {

    text(`
        Built-in GLSL shaders for Subpixel Morphological Anti-Aliasing (SMAA).
        A three-pass post-processing technique that smooths jagged edges with
        minimal blurring. Higher quality than FXAA with lower cost than MSAA.
    `)


    section('Pass 1: Edge Detection', () => {

        text(`
            Detects edges using luminance differences with local contrast
            adaptation to avoid false positives in high-frequency areas.

            Uniforms:
            - \`uColorTexture\` (sampler2D) — input scene color
            - \`uTexelSize\` (vec2) — 1/resolution

            Output: RG texture where R=left edge, G=top edge
        `)

        code('Edge Shader Uniforms', () => {
            const uniforms = SMAA_EDGE_SHADER_DEF.uniforms
        })

    })


    section('Pass 2: Blending Weight Calculation', () => {

        text(`
            Calculates blending weights by searching along edges and sampling
            precomputed lookup textures. Handles both orthogonal and diagonal
            edges with corner detection.

            Uniforms:
            - \`uEdgesTexture\` (sampler2D) — edge detection output
            - \`uAreaTexture\` (sampler2D) — precomputed area lookup
            - \`uSearchTexture\` (sampler2D) — precomputed search lookup
            - \`uViewportSize\` (vec2) — screen resolution
            - \`uTexelSize\` (vec2) — 1/resolution

            The area and search textures encode coverage patterns for
            different edge configurations, enabling accurate subpixel blending.
        `)

        code('Weight Shader Uniforms', () => {
            const uniforms = SMAA_WEIGHT_SHADER_DEF.uniforms
        })

    })


    section('Pass 3: Neighborhood Blending', () => {

        text(`
            Final pass that blends neighboring pixels based on the computed
            weights to smooth edges while preserving texture detail.

            Uniforms:
            - \`uColorTexture\` (sampler2D) — original scene color
            - \`uBlendTexture\` (sampler2D) — blending weights from pass 2
            - \`uTexelSize\` (vec2) — 1/resolution
        `)

        code('Blend Shader Uniforms', () => {
            const uniforms = SMAA_BLEND_SHADER_DEF.uniforms
        })

    })

})
