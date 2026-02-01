import {doc, section, text, code, action, logger} from '../../../doc/runtime.js'
import ColorGradePass from './color_grade_pass.js'


export default doc('ColorGradePass', {advanced: true}, () => {

    text(`
        Adjusts brightness, contrast, and saturation of the rendered scene. Extends
        [[RenderPass@render/postprocessing]] with a simple color grading fragment shader.
    `)


    section('Uniforms', () => {

        text(`
            - \`uBrightness\` — additive brightness offset (-0.5 to 0.5).
            - \`uContrast\` — contrast multiplier (0.5 to 1.5, 1.0 = neutral).
            - \`uSaturation\` — saturation multiplier (0 = grayscale, 1.0 = neutral, 2.0 = vivid).
        `)

        action('Default values', () => {
            const pass = new ColorGradePass()

            logger.log('brightness:', pass.uniforms.uBrightness)
            logger.log('contrast:', pass.uniforms.uContrast)
            logger.log('saturation:', pass.uniforms.uSaturation)
        })

        code('Desaturated look', () => {
            const pass = new ColorGradePass()

            pass.setUniform('uBrightness', -0.05)
            pass.setUniform('uContrast', 1.1)
            pass.setUniform('uSaturation', 0.6)
        })

    })

})
