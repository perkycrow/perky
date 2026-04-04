import {doc, section, text, code} from '../../doc/runtime.js'
import WebGLObjectRenderer from './webgl_object_renderer.js'


export default doc('WebGLObjectRenderer', {advanced: true}, () => {

    text(`
        Base class for all WebGL object renderers. Provides the collect/flush
        pattern: during scene traversal, objects are collected with their opacity
        and hints, then flushed in a single batch at the end of the frame.

        Subclass this to create renderers for new object types. Register them
        with the WebGL renderer via its renderer registry.
    `)


    section('Lifecycle', () => {

        text(`
            The renderer lifecycle follows three steps each frame:

            1. \`reset()\` — clears the collected objects list
            2. \`collect(object, opacity, hints)\` — called for each visible object during traversal
            3. \`flush()\` — draws everything at once, override this in subclasses
        `)

        code('Subclass example', () => {
            class CustomRenderer extends WebGLObjectRenderer {

                static get handles () {
                    return [CustomObject]
                }

                flush () {
                    for (const {object, opacity} of this.collected) {
                        drawCustomObject(object, opacity)
                    }
                }

            }
        })

    })


    section('handles', () => {

        text(`
            Static getter that returns an array of object classes this renderer
            handles. The renderer registry uses this to route objects to the
            correct renderer during traversal.
        `)

        code('Declaring handles', () => {
            class MyRenderer extends WebGLObjectRenderer {
                static get handles () {
                    return [MyObject]
                }
            }
        })

    })


    section('Disposal', () => {

        text(`
            Call \`dispose()\` to release GPU resources. The base implementation
            clears the collected list and nulls the GL context. Subclasses should
            clean up their own buffers and call \`super.dispose()\`.
        `)

    })

})
