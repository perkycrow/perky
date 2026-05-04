import {doc, section, text, code} from '../../../doc/runtime.js'
import CinematicEffect from './cinematic_effect.js'


export default doc('CinematicEffect', {advanced: true}, () => {

    text(`
        Post-processing effect bundle for film-style visuals. Combines
        vignette, color grading, film grain, and paper texture overlay
        in a single pass.
    `)


    section('Properties', () => {

        text(`
            \`enabled\` — toggle effect on/off

            Vignette:
            - \`vignetteIntensity\` — edge darkening strength (default: 0.4)
            - \`vignetteSmoothness\` — falloff softness (default: 0.8)

            Color grading:
            - \`saturation\` — color intensity (1.0 = normal, 0 = grayscale)
            - \`temperature\` — warm/cool shift (-1 to 1, default: 0)
            - \`brightness\` — overall brightness multiplier (default: 1.0)
            - \`contrast\` — contrast multiplier (default: 1.0)

            Film effects:
            - \`grainIntensity\` — animated noise overlay (default: 0)
            - \`colorLevels\` — posterization bands (0 = off)
            - \`paperIntensity\` — paper texture overlay (default: 0)
        `)

        code('Configuring cinematic look', () => {
            cinematic.enabled = true
            cinematic.vignetteIntensity = 0.5
            cinematic.saturation = 0.9
            cinematic.temperature = 0.1
            cinematic.grainIntensity = 0.05
        })

    })


    section('Rendering', () => {

        text(`
            \`init(shaderRegistry, gl)\` — registers shader and creates paper texture

            \`render(gl, ctx, sceneTexture, time)\` — applies all effects in one pass

            The paper texture is procedurally generated noise for an
            organic, hand-made feel when overlaid on the scene.
        `)

    })


    section('Cleanup', () => {

        text(`
            \`dispose(gl)\` deletes the paper texture.
        `)

    })

})
