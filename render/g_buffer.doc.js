import {doc, section, text, code} from '../doc/runtime.js'
import GBuffer from './g_buffer.js'


export default doc('GBuffer', {advanced: true}, () => {

    text(`
        Framebuffer with multiple render targets for deferred rendering.
        Stores albedo, normals, material properties, and depth in separate
        textures for the lighting pass to read.
    `)


    section('Constructor', () => {

        text(`
            Creates a G-buffer with four textures attached to a single
            framebuffer.

            Options:
            - \`gl\` — WebGL2 rendering context
            - \`width\` — buffer width in pixels
            - \`height\` — buffer height in pixels
        `)

        code('Creating a G-buffer', () => {
            const gBuffer = new GBuffer({gl, width: 1920, height: 1080})
        })

    })


    section('Textures', () => {

        text(`
            Four textures store geometry pass output:

            \`albedoTexture\` — RGBA8 color texture
            - RGB: base surface color
            - A: opacity

            \`normalTexture\` — RGBA8 normal texture
            - RGB: world-space normal (encoded 0-1)
            - A: unlit flag

            \`materialTexture\` — RGBA8 material texture
            - R: roughness
            - G: specular intensity
            - B: emissive strength
            - A: reserved

            \`depthTexture\` — DEPTH_COMPONENT24
            - Standard depth buffer for lighting reconstruction
        `)

    })


    section('Rendering', () => {

        text(`
            \`begin()\` — binds framebuffer, sets draw buffers, clears all targets

            \`resume()\` — binds framebuffer without clearing (for multi-pass)

            \`end()\` — unbinds framebuffer

            \`resize(width, height)\` — recreates all textures at new size

            \`blitDepthTo(targetFramebuffer)\` — copies depth to another framebuffer
        `)

        code('Geometry pass', () => {
            gBuffer.begin()
            renderer.drawMeshes(scene)
            gBuffer.end()
        })

    })


    section('Cleanup', () => {

        text(`
            \`dispose()\` deletes all GPU resources (framebuffer and textures).
        `)

    })

})
