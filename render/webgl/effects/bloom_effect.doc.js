import {doc, section, text, code} from '../../../doc/runtime.js'
import BloomEffect from './bloom_effect.js'


export default doc('BloomEffect', {advanced: true}, () => {

    text(`
        Screen-space bloom effect that extracts bright areas and blurs
        them to create a glow. Uses threshold-based extraction with
        soft falloff and multi-pass Gaussian blur.
    `)


    section('Properties', () => {

        text(`
            \`enabled\` — toggle effect on/off

            \`threshold\` — minimum brightness to bloom (default: 0.8)

            \`softThreshold\` — falloff softness below threshold (default: 0.5)

            \`intensity\` — bloom strength when composited (default: 0.3)

            \`passes\` — number of blur iterations (default: 2, more = smoother)
        `)

        code('Configuring bloom', () => {
            bloom.enabled = true
            bloom.threshold = 0.7
            bloom.intensity = 0.5
            bloom.passes = 3
        })

    })


    section('Rendering', () => {

        text(`
            \`init(shaderRegistry)\` — registers extract and blur shaders

            \`render(gl, ctx, sceneTexture)\` — runs extract and blur passes

            \`composite(gl, ctx)\` — blends bloom over the scene (additive)

            Rendering happens at half resolution for performance. The blur
            uses ping-pong buffers with separable horizontal/vertical passes.
        `)

    })


    section('Algorithm', () => {

        text(`
            1. Extract: pixels above threshold are kept, others fade to black
            2. Blur: multi-pass Gaussian blur at half resolution
            3. Composite: additively blend bloom over scene using intensity

            Soft threshold creates smooth transitions instead of harsh cutoffs.
        `)

    })


    section('Cleanup', () => {

        text(`
            \`dispose(gl)\` deletes framebuffers and textures.
        `)

    })

})
