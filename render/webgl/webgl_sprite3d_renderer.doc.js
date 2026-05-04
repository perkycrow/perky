import {doc, section, text, code} from '../../doc/runtime.js'
import WebGLSprite3DRenderer from './webgl_sprite3d_renderer.js'


export default doc('WebGLSprite3DRenderer', {advanced: true}, () => {

    text(`
        WebGL renderer for Sprite3D objects. Renders billboarded quads
        to the G-buffer with deferred lighting support.
    `)


    section('Registration', () => {

        text(`
            Automatically registered for Sprite3D objects.
        `)

        code('Handled types', () => {
            const types = WebGLSprite3DRenderer.handles
        })

    })


    section('Dependencies', () => {

        text(`
            Must have camera and G-buffer assigned before rendering:

            \`camera3d\` — Camera3D for view/projection matrices

            \`gBuffer\` — GBuffer to render into

            These are typically set by the WebGLRenderer during 3D scene setup.
        `)

    })


    section('Rendering', () => {

        text(`
            \`flushToGBuffer(gl)\` — renders all collected sprites to the G-buffer

            Each sprite is rendered as a camera-facing quad. The vertex shader
            computes billboarding, and depth is written from the sprite center
            for correct sorting.

            Material properties (color, roughness, specular, emissive) are
            passed as uniforms when a Material3D is attached.
        `)

    })


    section('Cleanup', () => {

        text(`
            \`dispose()\` releases the internal quad mesh and shader references.
        `)

    })

})
