import {doc, section, text, action, logger} from '../../../../doc/runtime.js'
import OutlineEffect from './outline_effect.js'


export default doc('OutlineEffect (Shader)', {advanced: true}, () => {

    text(`
        GPU-side outline effect for sprites. Extends [[ShaderEffect@render/shaders]]
        and injects a GLSL fragment snippet that samples neighboring texels to
        detect edges, then draws an outline around the sprite's silhouette.

        This is the shader-level counterpart to [[OutlineEffect@render/sprite_effects]]
        which operates at a higher level. Use this one for GPU-accelerated outlines
        that compose with other shader effects.
    `)


    section('How It Works', () => {

        text(`
            The fragment snippet checks if the current texel is transparent
            (\`alpha < 0.5\`). If any of its eight neighbors (cardinal and diagonal)
            has alpha, the texel is on the edge and gets colored with the outline
            color. The \`width\` parameter controls how far the sampling reaches
            (scaled by texel size).
        `)

    })


    section('Configuration', () => {

        text(`
            Two parameters control the outline:

            - \`width\` — outline thickness (default \`0.02\`)
            - \`color\` — outline color as \`[r, g, b]\` array (default \`[1, 1, 1]\` white)
        `)

        action('Default outline', () => {
            const effect = new OutlineEffect()

            logger.log('type:', effect.type)
            logger.log('width:', effect.width)
            logger.log('color:', effect.color)
            logger.log('params:', effect.getParams())
        })

        action('Custom width', () => {
            const effect = new OutlineEffect({width: 0.05})

            logger.log('width:', effect.width)
            logger.log('params:', effect.getParams())
        })

        action('Custom color', () => {
            const effect = new OutlineEffect({color: [1, 0, 0]})

            logger.log('color:', effect.color)
            logger.log('params:', effect.getParams())
        })

    })

})
