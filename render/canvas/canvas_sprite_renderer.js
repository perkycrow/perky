import CanvasObjectRenderer from './canvas_object_renderer.js'
import Sprite from '../sprite.js'


export default class CanvasSpriteRenderer extends CanvasObjectRenderer {

    static get handles () {
        return [Sprite]
    }


    render (sprite, ctx) { // eslint-disable-line local/class-methods-use-this -- clean
        const region = sprite.region

        if (!region || !region.image) {
            return
        }

        const img = region.image

        if (!img.complete || img.naturalWidth === 0) {
            return
        }

        const {x, y, width: w, height: h} = region.bounds
        const bounds = sprite.getBounds()

        ctx.save()
        ctx.scale(1, -1)
        ctx.drawImage(
            img,
            x, y, w, h,
            bounds.minX,
            -bounds.maxY,
            bounds.width, bounds.height
        )
        ctx.restore()
    }

}
