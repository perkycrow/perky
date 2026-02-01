import {doc, section, text, code} from '../../doc/runtime.js'
import CanvasCircleRenderer from './canvas_circle_renderer.js'
import Circle from '../circle.js'


export default doc('CanvasCircleRenderer', {advanced: true}, () => {

    text(`
        Canvas 2D renderer for [[Circle@render]] objects. Extends [[CanvasObjectRenderer@render/canvas]]
        and is registered automatically by [[CanvasRenderer@canvas_renderer]].
    `)


    section('Handled Types', () => {

        text('Renders [[Circle@render]] objects.')

        code('Registration', () => {
            CanvasCircleRenderer.handles // [Circle]
        })

    })


    section('Rendering', () => {

        text(`
            Draws a filled circle using \`ctx.arc\`. Applies the anchor offset so
            the circle is positioned relative to its anchor point. Adds a stroke
            if \`strokeWidth\` is greater than zero.
        `)

        code('Render call', () => {
            const renderer = new CanvasCircleRenderer()

            // Called internally by CanvasRenderer during flush
            // renderer.render(circle, ctx)
        })

    })

})
