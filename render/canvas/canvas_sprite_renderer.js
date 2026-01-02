import CanvasObjectRenderer from './canvas_object_renderer.js'
import Sprite2D from '../sprite_2d.js'


export default class CanvasSpriteRenderer extends CanvasObjectRenderer {

    static get handles () {
        return [Sprite2D]
    }


    render (sprite, ctx) { // eslint-disable-line local/nested-complexity -- clean
        const img = sprite.image || (sprite.currentFrame ? sprite.currentFrame.image : null)

        if (img && img.complete && img.naturalWidth > 0 && sprite.currentFrame) {
            const {x, y, w, h} = sprite.currentFrame.frame

            let renderW = w
            let renderH = h

            if (sprite.width !== null) {
                renderW = sprite.width
                renderH = (h / w) * renderW
            } else if (sprite.height !== null) {
                renderH = sprite.height
                renderW = (w / h) * renderH
            }

            const offsetX = -renderW * sprite.anchorX
            const offsetY = -renderH * sprite.anchorY

            ctx.save()

            ctx.scale(1, -1)

            ctx.drawImage(
                img,
                x, y, w, h,
                offsetX,
                -offsetY - renderH,
                renderW, renderH
            )

            ctx.restore()
        }
    }

}
