import {doc, section, text, code} from '../../doc/runtime.js'
import FramebufferManager from './framebuffer_manager.js'


export default doc('FramebufferManager', {advanced: true}, () => {

    text(`
        Manages WebGL2 framebuffers for post-processing. Provides an MSAA scene buffer,
        a resolve target, a ping-pong pair for chaining passes, and named buffers for
        custom render targets.
    `)


    section('Pipeline', () => {

        text(`
            The typical flow:

            1. \`bindSceneBuffer()\` — render the scene into the MSAA framebuffer.
            2. \`resolveSceneBuffer()\` — blit MSAA into a regular texture.
            3. For each pass: \`bindPingPong()\`, render, \`swapAndGetTexture()\`.
            4. \`bindScreen()\` — final output to the default framebuffer.
        `)

        code('Post-processing loop', () => {
            const fbm = new FramebufferManager(gl, 800, 600)

            fbm.bindSceneBuffer()

            // ... render scene ...

            fbm.resolveSceneBuffer()
            fbm.resetPingPong()

            let input = fbm.getSceneTexture()
            for (const pass of passes) {
                fbm.bindPingPong()
                pass.render(gl, input, fullscreenQuad)
                input = fbm.swapAndGetTexture()
            }

            fbm.bindScreen()

            // ... draw final quad with `input` ...
        })

    })


    section('Named Buffers', () => {

        text(`
            Create additional framebuffer/texture pairs by name. Useful for render groups
            or multi-pass techniques that need intermediate storage.
        `)

        code('Named buffer usage', () => {
            const fbm = new FramebufferManager(gl, 800, 600)

            fbm.getOrCreateBuffer('shadow')
            fbm.bindBuffer('shadow')

            // ... render shadow map ...

            const shadowTexture = fbm.getBufferTexture('shadow')

            fbm.disposeBuffer('shadow')
        })

    })


    section('Resize and Disposal', () => {

        text(`
            Call \`resize()\` when the canvas dimensions change — all framebuffers are
            recreated. Call \`dispose()\` to free all GPU resources.
        `)

        code('Resize', () => {
            fbm.resize(1024, 768)
        })

    })

})
