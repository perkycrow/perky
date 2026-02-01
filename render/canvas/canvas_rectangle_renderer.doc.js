import {doc, section, text, code} from '../../doc/runtime.js'
import CanvasRectangleRenderer from './canvas_rectangle_renderer.js'
import Rectangle from '../rectangle.js'


export default doc('CanvasRectangleRenderer', {advanced: true}, () => {

    text(`
        Canvas 2D renderer for [[Rectangle@render]] objects. Extends [[CanvasObjectRenderer@render/canvas]]
        and is registered automatically by [[CanvasRenderer@canvas_renderer]].
    `)


    section('Handled Types', () => {

        text('Renders [[Rectangle@render]] objects.')

        code('Registration', () => {
            CanvasRectangleRenderer.handles // [Rectangle]
        })

    })


    section('Rendering', () => {

        text(`
            Draws a filled rectangle using \`ctx.fillRect\`. Applies the anchor offset
            so the rectangle is positioned relative to its anchor point. Skips the fill
            if the color is \`null\` or \`'transparent'\`. Adds a stroke if \`strokeWidth\`
            is greater than zero.
        `)

        code('Render call', () => {
            const renderer = new CanvasRectangleRenderer()

            // Called internally by CanvasRenderer during flush
            // renderer.render(rect, ctx)
        })

    })

})
