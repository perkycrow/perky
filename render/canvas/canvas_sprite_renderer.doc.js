import {doc, section, text, code} from '../../doc/runtime.js'
import CanvasSpriteRenderer from './canvas_sprite_renderer.js'
import Sprite from '../sprite.js'


export default doc('CanvasSpriteRenderer', {advanced: true}, () => {

    text(`
        Canvas 2D renderer for [[Sprite@render]] objects. Extends [[CanvasObjectRenderer@render/canvas]]
        and is registered automatically by [[CanvasRenderer@canvas_renderer]].
    `)


    section('Handled Types', () => {

        text('Renders [[Sprite@render]] objects. The renderer checks the static `handles` getter to match object types.')

        code('Registration', () => {
            CanvasSpriteRenderer.handles // [Sprite]
        })

    })


    section('Rendering', () => {

        text(`
            Draws the sprite's current texture region onto the canvas context.
            Skips rendering if the region or image is missing or not yet loaded.
            The image is flipped vertically to match the Y-up coordinate system.
        `)

        code('Render call', () => {
            const renderer = new CanvasSpriteRenderer()

            // Called internally by CanvasRenderer during flush
            // renderer.render(sprite, ctx)
        })

    })

})
