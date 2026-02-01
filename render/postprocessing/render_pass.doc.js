import {doc, section, text, code, action, logger} from '../../doc/runtime.js'
import RenderPass from './render_pass.js'


export default doc('RenderPass', {advanced: true}, () => {

    text(`
        Base class for post-processing passes. Extends [[PerkyModule@core]] with shader
        compilation, uniform management, and a standard render method that draws a
        fullscreen quad with the input texture.

        Subclass this to create custom passes like vignette, bloom, or color grading.
    `)


    section('Creating a Pass', () => {

        text(`
            Define a static \`shaderDefinition\` with vertex/fragment GLSL, uniforms, and
            attributes. Set \`defaultUniforms\` for initial values and \`uniformConfig\` for
            inspector metadata.
        `)

        code('Subclass example', () => {
            class GrayscalePass extends RenderPass {

                static shaderDefinition = {
                    vertex: '...',
                    fragment: '...',
                    uniforms: ['uTexture', 'uAmount'],
                    attributes: ['aPosition', 'aTexCoord']
                }

                static defaultUniforms = {
                    uAmount: 1.0
                }

            }
        })

    })


    section('Uniforms', () => {

        text(`
            Read and write uniform values with \`uniforms\` and \`setUniform()\`.
            Values are applied automatically during \`render()\`. Supports floats,
            vec2, vec3, and vec4 (as arrays).
        `)

        action('Default uniforms', () => {
            const pass = new RenderPass()

            logger.log('uniforms:', pass.uniforms)
            logger.log('enabled:', pass.enabled)
        })

        code('Set a uniform', () => {
            pass.setUniform('uIntensity', 0.5)
            pass.setUniform('uColor', [1.0, 0.0, 0.0])
        })

    })


    section('Enable / Disable', () => {

        text('Toggle a pass on or off. Disabled passes are skipped during rendering.')

        action('Toggle enabled', () => {
            const pass = new RenderPass()

            logger.log('enabled:', pass.enabled)

            pass.enabled = false
            logger.log('enabled:', pass.enabled)
        })

    })

})
