import {doc, section, text, code} from '../../../doc/runtime.js'
import SsaoEffect from './ssao_effect.js'


export default doc('SsaoEffect', {advanced: true}, () => {

    text(`
        Screen-Space Ambient Occlusion effect. Darkens crevices and
        corners where ambient light would naturally be occluded,
        adding depth and realism without expensive global illumination.
    `)


    section('Properties', () => {

        text(`
            \`enabled\` — toggle effect on/off

            \`radius\` — sampling hemisphere radius (default: 0.5)

            \`bias\` — depth comparison bias to prevent self-occlusion (default: 0.025)

            \`intensity\` — occlusion darkening strength (default: 1.5)

            \`outputTexture\` — blurred occlusion texture for lighting pass
        `)

        code('Configuring SSAO', () => {
            ssao.enabled = true
            ssao.radius = 0.8
            ssao.intensity = 2.0
        })

    })


    section('Algorithm', () => {

        text(`
            1. Sample depth in a hemisphere around each pixel
            2. Compare sample depths to actual geometry depth
            3. Accumulate occlusion from samples behind the surface
            4. Apply bilateral blur to smooth noise while preserving edges

            Uses a 16-sample kernel with per-pixel random rotation to
            reduce banding. Renders at half resolution for performance.
        `)

    })


    section('Rendering', () => {

        text(`
            \`init(shaderRegistry)\` — registers SSAO and blur shaders

            \`render(gl, ctx)\` — computes occlusion and applies blur

            The output texture is read by the lighting shader to
            modulate ambient lighting.
        `)

    })


    section('Cleanup', () => {

        text(`
            \`dispose(gl)\` deletes framebuffers and textures.
        `)

    })

})
