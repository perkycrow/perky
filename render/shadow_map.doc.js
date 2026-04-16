import {doc, section, text, code} from '../doc/runtime.js'
import ShadowMap from './shadow_map.js'


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
            const canvas = document.createElement('canvas')
            const gl = canvas.getContext('webgl2')

            const shadowMap = new ShadowMap({
                gl,
                resolution: 2048
            })
        })

    })


    section('Properties', () => {

        text(`
            Access shadow map state and matrices for shader uniforms.
        `)

        code('Available properties', () => {
            const canvas = document.createElement('canvas')
            const gl = canvas.getContext('webgl2')
            const shadowMap = new ShadowMap({gl})

            shadowMap.texture
            shadowMap.resolution
            shadowMap.lightMatrix
            shadowMap.lightProjection
            shadowMap.lightView
        })

    })


    section('update', () => {

        text(`
            Recalculates the light matrices based on a directional light and
            camera position. The light looks at the camera from a distance
            determined by sceneRadius (defaults to 20).
        `)

        code('Update light matrices', () => {
            const canvas = document.createElement('canvas')
            const gl = canvas.getContext('webgl2')
            const shadowMap = new ShadowMap({gl})
            const camera3d = {position: {x: 0, y: 5, z: 10}}

            shadowMap.update(
                [0.5, -1, 0.3],
                camera3d,
                30
            )
        })

        code('Parameters', () => {
            const canvas = document.createElement('canvas')
            const gl = canvas.getContext('webgl2')
            const shadowMap = new ShadowMap({gl})
            const camera3d = {position: {x: 0, y: 0, z: 0}}

            shadowMap.update(
                [0, -1, 0],
                camera3d,
                20
            )
        })

    })


    section('Render Pass', () => {

        text(`
            Wrap your depth-only render calls between begin() and end().
            This binds the shadow framebuffer, sets the viewport, and clears
            the depth buffer.
        `)

        code('Shadow pass', () => {
            const canvas = document.createElement('canvas')
            const gl = canvas.getContext('webgl2')
            const shadowMap = new ShadowMap({gl})

            shadowMap.begin()
            shadowMap.end()
        })

        code('Typical usage', () => {
            const canvas = document.createElement('canvas')
            const gl = canvas.getContext('webgl2')
            const shadowMap = new ShadowMap({gl})
            const camera3d = {position: {x: 0, y: 5, z: 10}}

            shadowMap.update([0, -1, 0], camera3d, 50)

            shadowMap.begin()
            shadowMap.end()
        })

    })


    section('dispose', () => {

        text(`
            Cleans up the framebuffer and depth texture. Call when the shadow
            map is no longer needed.
        `)

        code('Cleanup', () => {
            const canvas = document.createElement('canvas')
            const gl = canvas.getContext('webgl2')
            const shadowMap = new ShadowMap({gl})

            shadowMap.dispose()
        })

    })

})
