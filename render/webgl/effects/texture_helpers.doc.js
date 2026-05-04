import {doc, section, text, code} from '../../../doc/runtime.js'


export default doc('Texture Helpers', {advanced: true}, () => {

    text(`
        Utility functions for creating textures and framebuffers used
        by post-processing effects. Provides consistent setup for
        screen-space rendering targets.
    `)


    section('createScreenTexture', () => {

        text(`
            Creates an RGBA8 texture suitable for screen-space effects.

            - Format: RGBA8 (8 bits per channel)
            - Filtering: LINEAR for smooth sampling
            - Wrapping: CLAMP_TO_EDGE to prevent edge artifacts
        `)

        code('Creating a screen texture', () => {
            const texture = createScreenTexture(gl, width, height)
        })

    })


    section('createHdrTexture', () => {

        text(`
            Creates an RGBA16F texture for high dynamic range effects.

            - Format: RGBA16F (16-bit float per channel)
            - Filtering: LINEAR
            - Wrapping: CLAMP_TO_EDGE

            Use for bloom extraction, volumetric fog, or any effect
            that needs values outside 0-1 range.
        `)

        code('Creating an HDR texture', () => {
            const hdrTexture = createHdrTexture(gl, width, height)
        })

    })


    section('createFBO', () => {

        text(`
            Creates a framebuffer with a single color attachment.

            Takes an existing texture and attaches it as COLOR_ATTACHMENT0.
        `)

        code('Creating a framebuffer', () => {
            const texture = createScreenTexture(gl, width, height)
            const fbo = createFBO(gl, texture)
        })

    })

})
