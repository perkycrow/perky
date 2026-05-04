import {doc, section, text, code} from '../../../doc/runtime.js'
import {BLOOM_EXTRACT_SHADER_DEF, BLOOM_BLUR_SHADER_DEF, BLOOM_COMPOSITE_SHADER_DEF} from './bloom_shader.js'


export default doc('Bloom Shader', {advanced: true}, () => {

    text(`
        Built-in GLSL shaders for bloom post-processing. Bloom creates a
        glow effect around bright areas. The effect uses three passes:
        extract, blur, and composite.
    `)


    section('Extract Pass', () => {

        text(`
            Extracts bright pixels from the scene based on a luminance
            threshold. Uses soft knee for smoother falloff.

            Uniforms:
            - \`uSceneColor\` — source scene texture
            - \`uThreshold\` (float) — brightness cutoff
            - \`uSoftThreshold\` (float) — soft knee factor
        `)

        code('Extract Shader Definition', () => {
            const uniforms = BLOOM_EXTRACT_SHADER_DEF.uniforms
        })

    })


    section('Blur Pass', () => {

        text(`
            Applies a 9-tap Gaussian blur in a single direction. Run twice
            (horizontal then vertical) for full separable blur.

            Uniforms:
            - \`uTexture\` — input texture to blur
            - \`uDirection\` (vec2) — blur direction (1,0) or (0,1)
            - \`uTexelSize\` (vec2) — pixel size in UV space
        `)

        code('Blur Shader Definition', () => {
            const uniforms = BLOOM_BLUR_SHADER_DEF.uniforms
        })

    })


    section('Composite Pass', () => {

        text(`
            Combines the blurred bloom with the original scene.

            Uniforms:
            - \`uSceneColor\` — original scene texture
            - \`uBloomTexture\` — blurred bloom texture
            - \`uBloomIntensity\` (float) — bloom strength multiplier
        `)

        code('Composite Shader Definition', () => {
            const uniforms = BLOOM_COMPOSITE_SHADER_DEF.uniforms
        })

    })

})
