import {doc, section, text, code} from '../../../doc/runtime.js'
import SmaaEffect from './smaa_effect.js'


export default doc('SmaaEffect', {advanced: true}, () => {

    text(`
        Subpixel Morphological Anti-Aliasing (SMAA) effect. A three-pass
        technique that smooths jagged edges with minimal blurring. Higher
        quality than FXAA with lower cost than MSAA.
    `)


    section('Properties', () => {

        text(`
            \`enabled\` — toggle effect on/off (default: true)

            \`ready\` — true when lookup textures are loaded (async)

            Lookup textures are loaded asynchronously from base64-encoded
            images. The effect won't render until \`ready\` is true.
        `)

        code('Checking readiness', () => {
            if (smaa.enabled && smaa.ready) {
                const output = smaa.render(gl, ctx, sceneTexture)
            }
        })

    })


    section('Algorithm', () => {

        text(`
            Three passes:

            1. Edge Detection — detects edges using luminance with local
               contrast adaptation to avoid false positives

            2. Weight Calculation — searches along edges and samples
               precomputed lookup textures to determine blend weights

            3. Neighborhood Blending — blends neighboring pixels based
               on computed weights to smooth edges

            The area and search textures encode coverage patterns for
            different edge configurations, enabling accurate subpixel
            anti-aliasing without supersampling.
        `)

    })


    section('Rendering', () => {

        text(`
            \`init(shaderRegistry, gl)\` — registers shaders and loads lookup textures

            \`render(gl, ctx, inputTexture)\` — runs all three passes

            Returns the anti-aliased output texture.
        `)

    })


    section('Cleanup', () => {

        text(`
            \`dispose(gl)\` deletes all framebuffers and textures (including
            the preloaded area and search textures).
        `)

    })

})
