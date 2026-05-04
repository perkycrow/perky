import {doc, section, text, code} from '../../../doc/runtime.js'
import {CINEMATIC_SHADER_DEF} from './cinematic_shader.js'


export default doc('Cinematic Shader', {advanced: true}, () => {

    text(`
        Built-in GLSL shader for cinematic post-processing. Combines
        multiple film-like effects: vignette, color grading, film grain,
        and paper texture overlay.
    `)


    section('Vertex Shader', () => {

        text(`
            Fullscreen pass-through. Outputs texture coordinates for
            fragment sampling.

            Attributes:
            - \`aPosition\` (vec2) — clip-space position
            - \`aTexCoord\` (vec2) — texture UV coordinates
        `)

    })


    section('Fragment Shader', () => {

        text(`
            Applies cinematic color grading and effects in sequence:
            saturation adjustment, contrast/brightness, color temperature,
            vignette darkening, film grain noise, and optional paper
            texture overlay.
        `)

    })


    section('Uniforms', () => {

        text(`
            Scene input:
            - \`uSceneColor\` — source scene texture
            - \`uTime\` (float) — animation time for grain

            Vignette:
            - \`uVignetteIntensity\` (float) — darkening strength
            - \`uVignetteSmoothness\` (float) — edge falloff

            Color grading:
            - \`uSaturation\` (float) — color intensity (1.0 = normal)
            - \`uTemperature\` (float) — warm/cool shift
            - \`uBrightness\` (float) — overall brightness
            - \`uContrast\` (float) — contrast amount

            Film effects:
            - \`uGrainIntensity\` (float) — noise strength
            - \`uPaperTexture\` — optional paper overlay
            - \`uPaperIntensity\` (float) — paper blend amount
            - \`uColorLevels\` (float) — posterization levels
        `)

        code('Shader Definition', () => {
            const uniforms = CINEMATIC_SHADER_DEF.uniforms
        })

    })

})
