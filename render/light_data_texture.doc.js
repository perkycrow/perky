import {doc, section, text, code, action, logger} from '../doc/runtime.js'
import LightDataTexture from './light_data_texture.js'


export default doc('LightDataTexture', () => {

    text(`
        GPU texture that packs [[Light3D@render]] data for shader access. Stores
        position, color, intensity, radius, and spotlight parameters in a float
        texture. Lights are sorted by distance to camera and culled by fog distance.
    `)


    section('Creation', () => {

        text('Create with a WebGL context and optional capacity.')

        code('Default capacity', () => {
            const lightData = new LightDataTexture(gl)
        })

        code('Custom capacity', () => {
            const lightData = new LightDataTexture(gl, {
                capacity: 128
            })
        })

    })


    section('Properties', () => {

        text('Access the GPU texture and capacity.')

        code('Available properties', () => {
            lightData.texture
            lightData.capacity
        })

    })


    section('Updating', () => {

        text(`
            Call update() each frame to pack light data into the texture. Lights
            are sorted by distance to camera, filtered by fog range, and limited
            by capacity. Returns the number of visible lights.
        `)

        code('Basic update', () => {
            const count = lightData.update(lights, cameraPosition, fogFar)
        })

        code('Usage in render loop', () => {
            const visibleCount = lightData.update(
                scene.lights,
                camera.position,
                fogSettings.far
            )

            gl.activeTexture(gl.TEXTURE1)
            gl.bindTexture(gl.TEXTURE_2D, lightData.texture)
            shader.setUniform('u_lightCount', visibleCount)
        })

    })


    section('Data Layout', () => {

        text(`
            Each light occupies 16 floats (4 RGBA pixels) in the texture:

            - Pixel 0: position.xyz, intensity
            - Pixel 1: color.rgb, radius
            - Pixel 2: direction.xyz, cosAngle
            - Pixel 3: cosPenumbra, reserved, reserved, reserved

            Point lights have direction set to (0,0,0) and cosAngle set to -1.
        `)

    })


    section('Disposal', () => {

        text('Release GPU resources when done.')

        code('Cleanup', () => {
            lightData.dispose()
        })

    })


    section('API', () => {

        code('Constructor', () => {
            const lightData = new LightDataTexture(gl, {
                capacity: 256
            })
        })

        code('Properties', () => {
            lightData.texture
            lightData.capacity
        })

        code('Methods', () => {
            lightData.update(lights, cameraPosition, fogFar)
            lightData.dispose()
        })

    })

})
