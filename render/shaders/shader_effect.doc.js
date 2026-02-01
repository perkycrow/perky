import {doc, section, text, code, action, logger} from '../../doc/runtime.js'
import ShaderEffect from './shader_effect.js'


export default doc('ShaderEffect', {advanced: true}, () => {

    text(`
        Base class for GPU-side sprite effects. Unlike [[SpriteEffect@render/sprite_effects]]
        which operates at a higher level, ShaderEffect defines GLSL snippets that get
        composed into a combined fragment shader by [[ShaderEffectRegistry@render/shaders]].

        Subclass this to create effects like outline, glow, or distortion that run
        directly on the GPU.
    `)


    section('Creating an Effect', () => {

        text('Effects have an enabled state, a type derived from the class name, and optional shader params.')

        action('Default effect', () => {
            const effect = new ShaderEffect()

            logger.log('type:', effect.type)
            logger.log('enabled:', effect.enabled)
            logger.log('params:', effect.getParams())
            logger.log('hints:', effect.getHints())
        })

        action('Created disabled', () => {
            const effect = new ShaderEffect({enabled: false})

            logger.log('enabled:', effect.enabled)
        })

    })


    section('Subclassing', () => {

        text(`
            Define a static \`shader\` object with:

            - \`params\` — property names read from the instance and packed into a vec4 for the GPU.
            - \`uniforms\` — additional uniform names the fragment snippet uses.
            - \`fragment\` — GLSL snippet injected into the combined fragment shader.

            Override these methods as needed:

            - \`getParams()\` — returns an array of param values (auto-generated from \`shader.params\`).
            - \`getHints()\` — return metadata for canvas fallback rendering.
            - \`update()\` — animate properties per frame.
            - \`dispose()\` — clean up resources.
        `)

        code('Custom shader effect', () => {
            class GlowEffect extends ShaderEffect {

                static shader = {
                    params: ['intensity', 'radius'],
                    uniforms: ['uTime'],
                    fragment: `
                        float glowAmount = intensity * 0.5;
                        color.rgb += glowAmount * color.a;
                    `
                }

                intensity = 1.0
                radius = 4.0

            }
        })

    })

})
