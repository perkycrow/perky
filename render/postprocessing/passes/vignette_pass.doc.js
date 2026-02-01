import {doc, section, text, code, action, logger} from '../../../doc/runtime.js'
import VignettePass from './vignette_pass.js'


export default doc('VignettePass', {advanced: true}, () => {

    text(`
        Darkens the edges of the screen to draw attention to the center. Extends
        [[RenderPass@render/postprocessing]] with a vignette fragment shader that
        supports configurable intensity, smoothness, roundness, and color.
    `)


    section('Uniforms', () => {

        text(`
            - \`uIntensity\` — how strong the darkening is (0 = off, 1 = full).
            - \`uSmoothness\` — transition width between dark and light.
            - \`uRoundness\` — 0 = wide ellipse, 1 = circular.
            - \`uColor\` — vignette color as an RGB array (default black).
        `)

        action('Default values', () => {
            const pass = new VignettePass()

            logger.log('intensity:', pass.uniforms.uIntensity)
            logger.log('smoothness:', pass.uniforms.uSmoothness)
            logger.log('roundness:', pass.uniforms.uRoundness)
            logger.log('color:', pass.uniforms.uColor)
        })

        code('Customize', () => {
            const pass = new VignettePass()

            pass.setUniform('uIntensity', 0.6)
            pass.setUniform('uSmoothness', 1.2)
            pass.setUniform('uColor', [0.1, 0.0, 0.05])
        })

    })

})
