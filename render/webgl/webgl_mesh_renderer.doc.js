import {doc, section, text, code} from '../../doc/runtime.js'


export default doc('WebGLMeshRenderer', {advanced: true}, () => {

    text(`
        WebGL renderer for [[MeshInstance@render]] objects. Handles 3D mesh
        drawing with lighting, shadows, fog, and material support.

        Registered automatically — mesh instances in the scene graph are
        routed here by the renderer registry when using the WebGL backend.
    `)


    section('Lighting', () => {

        text(`
            Supports both directional and point lights. The \`lightDirection\`
            property sets the main directional light. Point lights are passed
            via the \`lights\` array and packed into a data texture for
            efficient shader access.

            The \`ambient\` property controls minimum illumination level.
        `)

        code('Lighting setup', () => {
            renderer.lightDirection = [0.5, 1.0, 0.3]
            renderer.ambient = 0.2
            renderer.lights = [pointLight1, pointLight2]
        })

    })


    section('Shadows', () => {

        text(`
            When a [[ShadowMap@render]] is assigned, the renderer performs
            a depth-only shadow pass before the main render. Meshes with
            \`castShadow\` enabled contribute to the shadow map.
        `)

        code('Enabling shadows', () => {
            renderer.shadowMap = new ShadowMap(gl, 2048)
            mesh.castShadow = true
        })

    })


    section('Fog', () => {

        text(`
            Distance-based fog fades objects between \`fogNear\` and \`fogFar\`
            distances from the camera. Objects beyond \`fogFar\` blend fully
            into \`fogColor\`.
        `)

        code('Fog configuration', () => {
            renderer.fogNear = 20
            renderer.fogFar = 80
            renderer.fogColor = [0.0, 0.0, 0.0]
        })

    })


    section('Materials', () => {

        text(`
            Each mesh instance uses a [[Material3D@render]] for color,
            emissive, opacity, roughness, specular, and texture properties.
            Normal maps are supported via the material's \`normalMap\`
            property.
        `)

    })


    section('Disposal', () => {

        text(`
            \`dispose()\` releases shader references and the light data
            texture. Call it when shutting down the WebGL context.
        `)

    })

})
