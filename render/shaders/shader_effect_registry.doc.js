import {doc, section, text, code} from '../../doc/runtime.js'
import ShaderEffectRegistry from './shader_effect_registry.js'
import ShaderEffect from './shader_effect.js'


export default doc('ShaderEffectRegistry', {advanced: true}, () => {

    text(`
        Manages GPU shader effects for the WebGL sprite renderer. Registers
        [[ShaderEffect@render/shaders]] subclasses, composes their GLSL fragments
        into combined shader programs, and caches the results.

        Used internally by the WebGL renderer to batch sprites by effect combination.
    `)


    section('Registering Effects', () => {

        text(`
            Register effect classes by passing the class itself. The registry
            uses the class name as the key.
        `)

        code('Register an effect', () => {
            const registry = new ShaderEffectRegistry(gl, shaderRegistry)

            class GlowEffect extends ShaderEffect {
                static shader = {
                    params: ['intensity'],
                    uniforms: [],
                    fragment: 'color.rgb += intensity * color.a;'
                }
                intensity = 1.0
            }

            registry.register(GlowEffect)
            registry.has('GlowEffect')
            registry.get('GlowEffect')
        })

    })


    section('Shader Compilation', () => {

        text(`
            \`getShaderForEffects(effectTypes)\` takes an array of effect type names
            and returns a compiled [[ShaderProgram@render/shaders]] that combines all
            their GLSL fragments. Results are cached by the sorted combination of types.

            Each effect's \`shader.params\` are mapped to slots in a shared vec4
            (\`effectParams.x\`, \`.y\`, \`.z\`, \`.w\`), with a maximum of 4 params total
            across all active effects.
        `)

        code('Get a combined shader', () => {
            const registry = new ShaderEffectRegistry(gl, shaderRegistry)

            registry.register(OutlineEffect)
            registry.register(GlowEffect)

            const program = registry.getShaderForEffects(['OutlineEffect', 'GlowEffect'])
            program.use()
        })

    })


    section('Custom Uniforms', () => {

        text(`
            Set global uniform values that apply to all effect shaders.
            Common for time-based animations.
        `)

        code('Set and apply uniforms', () => {
            const registry = new ShaderEffectRegistry(gl, shaderRegistry)

            registry.setUniform('uTime', 1.5, 'float')
            registry.getUniform('uTime')

            registry.applyUniforms(gl, program)
        })

    })


    section('Disposal', () => {

        text('Call `dispose()` to clear all registered effects, cached shaders, and uniform values.')

        code('Clean up', () => {
            const registry = new ShaderEffectRegistry(gl, shaderRegistry)
            registry.dispose()
        })

    })

})
