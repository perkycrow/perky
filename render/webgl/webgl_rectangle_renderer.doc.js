import {doc, section, text, code} from '../../doc/runtime.js'
import WebGLRectangleRenderer from './webgl_rectangle_renderer.js'


export default doc('WebGLRectangleRenderer', {advanced: true}, () => {

    text(`
        WebGL renderer for [[Rectangle@render]] objects. Extends
        [[WebGLPrimitiveRenderer@render/webgl]] and draws filled quads with
        optional stroke lines.

        Registered automatically — rectangles in the scene graph are routed here
        by the renderer registry when using the WebGL backend.
    `)


    section('Rendering', () => {

        text(`
            The fill is drawn as a 4-vertex triangle fan. If \`strokeWidth\` is
            greater than zero, stroke lines are drawn on top using \`GL_LINES\`.
            Both fill and stroke colors are parsed from CSS strings via
            [[ColorUtils@render/webgl]]. Transparent fill colors are
            skipped entirely.
        `)

        code('Rectangle with stroke', () => {
            const rect = new Rectangle({
                width: 100,
                height: 50,
                color: '#00ff00',
                strokeColor: '#000000',
                strokeWidth: 2
            })

            rect.setPosition(50, 50)
            webglRenderer.render(scene)
        })

    })

})
