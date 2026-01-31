import {doc, section, text, code, action, logger} from '../doc/runtime.js'
import RenderTransform from './render_transform.js'


export default doc('RenderTransform', () => {

    text(`
        Base class for custom render transforms applied to \`RenderGroup\` objects.
        Subclass this to create transforms like shadow projection or skew effects.

        See \`ShadowTransform\` for a concrete implementation.
    `)


    section('Interface', () => {

        text(`
            RenderTransform defines the interface that renderers call during the
            render pass. The base implementation is a no-op pass-through.
        `)

        action('Default behavior', () => {
            const transform = new RenderTransform()

            logger.log('enabled:', transform.enabled)
            logger.log('getProgram:', transform.getProgram())

            const matrices = {projection: [1, 0, 0, 1], view: [1, 0, 0, 1]}
            const result = transform.apply({}, matrices)
            logger.log('apply returns matrices unchanged:', result === matrices)
        })

    })


    section('Enabled', () => {

        text('Transforms can be toggled on and off at runtime.')

        action('Toggle enabled', () => {
            const transform = new RenderTransform()
            logger.log('default:', transform.enabled)

            const disabled = new RenderTransform({enabled: false})
            logger.log('created disabled:', disabled.enabled)
        })

    })


    section('Subclassing', () => {

        text(`
            Override these methods to create a custom transform:

            - \`init(context)\` — called once when the renderer initializes. Register shaders here.
            - \`apply(context, matrices)\` — modify projection/view matrices before rendering.
            - \`getProgram()\` — return a custom shader program, or \`null\` for the default.
            - \`applyUniforms(gl, program)\` — set shader uniforms before draw calls.
            - \`dispose()\` — clean up resources.
        `)

        code('Custom transform skeleton', () => {
            class MyTransform extends RenderTransform {

                init (context) {
                    // Register shaders, acquire resources
                }

                apply (context, matrices) {
                    // Modify and return matrices
                    return matrices
                }

                getProgram () {
                    // Return custom shader program or null
                    return null
                }

                applyUniforms (gl, program) {
                    // Set uniforms on the shader program
                }

                dispose () {
                    // Clean up
                }

            }
        })

    })

})
