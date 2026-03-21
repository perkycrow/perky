import {doc, section, text, code} from '../../doc/runtime.js'


export default doc('WebGLDecalRenderer', {advanced: true}, () => {

    text(`
        WebGL renderer for [[Decal@render]] objects. Decals are textured quads
        projected onto 3D surfaces, commonly used for bullet holes, footprints,
        blood splatters, and other surface detail.

        Registered automatically — decals in the scene graph are routed here
        by the renderer registry when using the WebGL backend.
    `)


    section('Depth Handling', () => {

        text(`
            Decals use polygon offset to avoid z-fighting with the underlying
            surface. They're sorted back-to-front and rendered with depth
            writing disabled to support overlapping decals.
        `)

    })


    section('Positioning', () => {

        text(`
            Unlike billboards, decals don't face the camera. They use their
            \`worldMatrix\` to define position, rotation, and scale. Width
            and height properties control the quad size.
        `)

    })


    section('Fog', () => {

        text(`
            Supports distance-based fog via \`fogNear\`, \`fogFar\`, and \`fogColor\`
            properties, matching the [[WebGLMeshRenderer@render/webgl]] settings.
        `)

        code('Configuring fog', () => {
            renderer.fogNear = 10
            renderer.fogFar = 100
            renderer.fogColor = [0.1, 0.1, 0.15]
        })

    })


    section('Materials', () => {

        text(`
            Each decal can have a [[Material3D@render]] with color, emissive,
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
