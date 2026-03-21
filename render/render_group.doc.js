import {doc, section, text, code, action, logger} from '../doc/runtime.js'
import RenderGroup, {BLEND_MODES} from './render_group.js'


export default doc('RenderGroup', () => {

    text(`
        WebGL-only. Encapsulates a scene graph rendered to its own framebuffer.
        Supports blend modes (normal, additive, multiply) and per-group post-processing
        passes. Installed as a child of a [[WebGLRenderer@webgl_renderer]].
    `)


    section('Creation', () => {

        text('Create a render group with optional blend mode, post-processing passes, and render transform.')

        action('Default render group', () => {
            const group = new RenderGroup()
            logger.log('blend mode:', group.blendMode)
            logger.log('visible:', group.visible)
            logger.log('opacity:', group.opacity)
        })

        action('With options', () => {
            const group = new RenderGroup({
                blendMode: BLEND_MODES.additive,
                opacity: 0.8,
                visible: true
            })

            logger.log('blend mode:', group.blendMode)
            logger.log('opacity:', group.opacity)
        })

    })


    section('Blend Modes', () => {

        text('Available blend modes are `normal`, `additive`, and `multiply`.')

        action('List blend modes', () => {
            for (const [name, value] of Object.entries(BLEND_MODES)) {
                logger.log(name, '→', value)
            }
        })

    })


    section('Post-Processing Passes', () => {

        text(`
            Each group can have its own post-processing passes that are applied
            after rendering its content to the framebuffer.
        `)

        code('Adding a pass', () => {
            const group = new RenderGroup()

            group.addPostPass(myPass)
            group.hasActivePasses()
        })

        code('Removing a pass', () => {
            const group = new RenderGroup()
            group.addPostPass(myPass)

            group.removePostPass(myPass)
        })

    })


    section('Lifecycle', () => {

        text(`
            When installed on a renderer, the group initializes its passes and
            allocates a framebuffer. On dispose, all passes are cleaned up and
            the framebuffer is released.
        `)

    })

})
