import {doc, section, text, code} from '../../../doc/runtime.js'
import OutlineEffect from './outline_effect.js'


export default doc('OutlineEffect', {advanced: true}, () => {

    text(`
        Screen-space edge detection effect. Detects edges from depth and
        normal discontinuities in the G-buffer and draws them as colored
        outlines. Supports world-space wobble for a hand-drawn look.
    `)


    section('Properties', () => {

        text(`
            \`enabled\` — toggle effect on/off

            \`color\` — RGB array for outline color (default: [0, 0, 0])

            \`depthThreshold\` — sensitivity for depth edges (default: 0.001)

            \`normalThreshold\` — sensitivity for normal edges (default: 0.3)

            \`wobble\` — world-space noise displacement for organic lines (default: 0)
        `)

        code('Configuring outlines', () => {
            outline.enabled = true
            outline.color = [0.1, 0.1, 0.1]
            outline.depthThreshold = 0.002
            outline.normalThreshold = 0.4
            outline.wobble = 2.0
        })

    })


    section('Algorithm', () => {

        text(`
            Samples depth and normals in a cross pattern around each pixel.
            Depth edges detect silhouettes and object boundaries. Normal
            edges detect surface creases and hard edges.

            When wobble is enabled, sample coordinates are offset by
            value noise based on world position, creating organic
            hand-drawn line variation.

            Edge thickness increases with distance from camera to maintain
            visibility of far objects.
        `)

    })


    section('Rendering', () => {

        text(`
            \`init(shaderRegistry)\` — registers the outline shader

            \`render(gl, ctx, sceneTexture)\` — detects edges and draws outlines

            Returns the output texture for further processing.
        `)

    })


    section('Cleanup', () => {

        text(`
            \`dispose(gl)\` deletes framebuffer and texture.
        `)

    })

})
