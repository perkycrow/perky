import {doc, section, text, code, action, logger} from '../../doc/runtime.js'
import PostProcessor from './post_processor.js'


export default doc('PostProcessor', {advanced: true}, () => {

    text(`
        Manages a chain of [[RenderPass@render/postprocessing]] instances. Wraps the
        scene render in framebuffers, runs each enabled pass in sequence using ping-pong
        buffers, and outputs the final result to the screen.

        Extends [[PerkyModule@core]] and is typically owned by a [[WebGLRenderer@render]]
        or [[RenderGroup@render]].
    `)


    section('Adding Passes', () => {

        text(`
            Use \`addPass()\` to register a pass. The pass is initialized with the
            shader registry and appended to the chain. Order matters — passes run
            in the order they were added.
        `)

        code('Build a chain', () => {
            postProcessor.addPass(new VignettePass())
            postProcessor.addPass(new ColorGradePass())
        })

    })


    section('Render Loop Integration', () => {

        text(`
            Call \`begin()\` before rendering the scene and \`finish()\` after. If no
            passes are active, \`begin()\` returns \`false\` and the scene renders
            directly to screen.
        `)

        code('Typical usage', () => {
            const usingPost = postProcessor.begin()

            // ... render scene ...

            if (usingPost) {
                postProcessor.finish()
            }
        })

    })


    section('Managing Passes', () => {

        text('Remove individual passes or clear the entire chain.')

        code('Remove and clear', () => {
            postProcessor.removePass(vignettePass)

            postProcessor.clearPasses()
        })

    })


    section('Enable / Disable', () => {

        text(`
            Toggle the entire post-processor. When disabled, \`hasActivePasses()\`
            returns \`false\` and the scene renders without any passes.
        `)

        code('Toggle', () => {
            postProcessor.enabled = false
        })

    })

})
