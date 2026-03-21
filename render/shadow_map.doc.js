import {doc, section, text, code} from '../doc/runtime.js'


export default doc('ShadowMap', {advanced: true}, () => {

    text(`
        Manages a depth-only framebuffer for shadow mapping. Renders the scene
        from the light's perspective, stores depth values, then samples during
        the main pass to determine shadowed regions.
    `)


    section('Creation', () => {

        text(`
            Requires a WebGL2 context. Resolution defaults to 1024x1024.
        `)

        code('Create shadow map', () => {
            const shadowMap = new ShadowMap({
                gl: gl,
                resolution: 2048
            })
        })

    })


    section('Properties', () => {

        text(`
            - \`texture\` — the depth texture for sampling in the main shader
            - \`resolution\` — shadow map size in pixels
            - \`lightMatrix\` — combined projection * view matrix from light
            - \`lightProjection\` — orthographic projection matrix
            - \`lightView\` — look-at matrix from light position
        `)

    })


    section('update', () => {

        text(`
            Recalculates the light matrices based on a directional light and
            camera position. The light looks at the camera from a distance
            determined by \`sceneRadius\`.
        `)

        code('Update light matrices', () => {
            shadowMap.update(
                [0.5, -1, 0.3],
                camera3d,
                30
            )
        })

    })


    section('Render Pass', () => {

        text(`
            Wrap your depth-only render calls between \`begin()\` and \`end()\`.
            This binds the shadow framebuffer and sets the viewport.
        `)

        code('Shadow pass', () => {
            shadowMap.begin()
            shadowMap.end()
        })

    })


    section('dispose', () => {

        text(`
            Cleans up the framebuffer and depth texture. Call when the shadow
            map is no longer needed.
        `)

    })

})
