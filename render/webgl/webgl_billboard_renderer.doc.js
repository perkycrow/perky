import {doc, section, text, code} from '../../doc/runtime.js'


export default doc('WebGLBillboardRenderer', {advanced: true}, () => {

    text(`
        WebGL renderer for [[Billboard@render]] objects. Billboards are flat
        quads that always face the camera, commonly used for particles, sprites
        in 3D scenes, and distant objects.

        Registered automatically — billboards in the scene graph are routed here
        by the renderer registry when using the WebGL backend.
    `)


    section('Depth Sorting', () => {

        text(`
            Billboards are sorted back-to-front before rendering to ensure
            correct transparency. Depth writing is disabled during the flush
            to allow overlapping billboards to blend properly.
        `)

    })


    section('Fog', () => {

        text(`
            Supports distance-based fog via \`fogNear\`, \`fogFar\`, and \`fogColor\`
            properties. Objects beyond \`fogFar\` blend fully into the fog color.
        `)

        code('Configuring fog', () => {
            renderer.fogNear = 10
            renderer.fogFar = 100
            renderer.fogColor = [0.1, 0.1, 0.15]
        })

    })


    section('Materials', () => {

        text(`
            Each billboard can have a [[Material3D@render]] with color, emissive,
            opacity, and texture properties. The renderer applies these per-object
            before drawing.
        `)

    })


    section('Disposal', () => {

        text(`
            \`dispose()\` cleans up the internal quad mesh and shader reference.
            Call it when removing the renderer or shutting down the WebGL context.
        `)

    })

})
