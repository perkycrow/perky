import {doc, section, text, code} from '../../doc/runtime.js'
import CanvasLineRenderer from './canvas_line_renderer.js'
import Line from '../line.js'


export default doc('CanvasLineRenderer', {advanced: true}, () => {

    text(`
        Canvas 2D renderer for [[Line@render]] objects. Extends [[CanvasObjectRenderer@render/canvas]]
        and is registered automatically by [[CanvasRenderer@canvas_renderer]].
    `)


    section('Handled Types', () => {

        text('Renders [[Line@render]] objects.')

        code('Registration', () => {
            CanvasLineRenderer.handles // [Line]
        })

    })


    section('Rendering', () => {

        text(`
            Draws a line from the object's origin (0, 0) to \`(x2, y2)\` using
            \`ctx.lineTo\`. The line color and width are set via \`strokeStyle\`
            and \`lineWidth\`.
        `)

        code('Render call', () => {
            const renderer = new CanvasLineRenderer()

            // Called internally by CanvasRenderer during flush
            // renderer.render(line, ctx)
        })

    })

})
