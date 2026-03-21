import {doc, section, text, code} from '../../doc/runtime.js'


export default doc('WebGLSkyboxRenderer', {advanced: true}, () => {

    text(`
        WebGL renderer for [[Skybox@render]] backgrounds. Draws an infinitely
        distant sky dome behind all other 3D content using a unit cube
        rendered with depth at the far plane.

        Unlike other object renderers, the skybox renderer doesn't collect
        objects during traversal. Instead, assign a skybox directly via the
        \`skybox\` property.
    `)


    section('Usage', () => {

        text(`
            Set the \`skybox\` and \`camera3d\` properties before calling
            \`flush()\`. The skybox is drawn first in the render pass,
            before opaque geometry.
        `)

        code('Basic setup', () => {
            renderer.camera3d = camera
            renderer.skybox = new Skybox({
                skyColor: [0.1, 0.2, 0.4],
                horizonColor: [0.6, 0.5, 0.4],
                groundColor: [0.2, 0.15, 0.1]
            })
        })

    })


    section('Gradient Mode', () => {

        text(`
            The built-in skybox shader renders a vertical gradient from
            \`groundColor\` through \`horizonColor\` to \`skyColor\`.
            This works well for outdoor scenes without requiring texture
            assets.
        `)

    })


    section('Camera Rotation', () => {

        text(`
            The renderer strips the translation component from the camera's
            view matrix, keeping only rotation. This makes the skybox appear
            infinitely distant regardless of camera position.
        `)

    })


    section('Disposal', () => {

        text(`
            \`dispose()\` releases the cube mesh and shader reference.
            Call it when shutting down the WebGL context.
        `)

    })

})
