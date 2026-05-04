import {doc, section, text, code} from '../doc/runtime.js'
import CubeShadowMap from './cube_shadow_map.js'


export default doc('CubeShadowMap', {advanced: true}, () => {

    text(`
        Cube map shadow buffer for point light shadows. Renders the scene
        six times (one per cube face) to capture omnidirectional depth.
    `)


    section('Constructor', () => {

        text(`
            Creates a cube shadow map with R32F format for linear depth storage.

            Options:
            - \`gl\` — WebGL2 rendering context
            - \`resolution\` — cube face size in pixels (default: 512)
        `)

        code('Creating a cube shadow map', () => {
            const shadowMap = new CubeShadowMap({gl, resolution: 1024})
        })

    })


    section('Updating', () => {

        text(`
            \`update(lightPosition, far)\` computes projection and view matrices
            for all six cube faces.

            The projection uses a 90° FOV to cover each face exactly.
            View matrices look along each axis (+X, -X, +Y, -Y, +Z, -Z).

            \`projection\` — shared perspective matrix for all faces

            \`getView(faceIndex)\` — returns view matrix for face 0-5
        `)

        code('Update matrices', () => {
            shadowMap.update(light.position, light.range)
            const view = shadowMap.getView(0)
        })

    })


    section('Rendering', () => {

        text(`
            \`beginFace(faceIndex)\` — binds framebuffer to cube face, clears to white (far depth)

            \`end()\` — unbinds framebuffer

            Render the scene six times, once per face. The depth shader
            writes linear depth (distance/far) to the R channel.
        `)

        code('Rendering all faces', () => {
            for (let face = 0; face < 6; face++) {
                shadowMap.beginFace(face)
                renderer.drawDepth(scene, shadowMap.projection, shadowMap.getView(face))
            }
            shadowMap.end()
        })

    })


    section('Dirty Tracking', () => {

        text(`
            \`dirty\` — true if shadow map needs re-rendering

            \`markDirty()\` — flag for re-render (call when light or scene changes)

            \`markClean()\` — clear flag after rendering
        `)

    })


    section('Cleanup', () => {

        text(`
            \`dispose()\` deletes all GPU resources (framebuffer, cube texture,
            depth renderbuffer).
        `)

    })

})
