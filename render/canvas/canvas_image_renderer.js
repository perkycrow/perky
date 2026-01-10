import CanvasObjectRenderer from './canvas_object_renderer.js'
import Image2D from '../image_2d.js'


export default class CanvasImageRenderer extends CanvasObjectRenderer {

    static get handles () {
        return [Image2D]
    }


    render (image, ctx) { // eslint-disable-line local/class-methods-use-this -- clean
        const region = image.region

        if (!region || !region.image || !region.image.complete) {
            return
        }

        const bounds = image.getBounds()
        const {x, y, width: w, height: h} = region.bounds

        ctx.save()
        ctx.scale(1, -1)
        ctx.drawImage(
            region.image,
            x, y, w, h,
            bounds.minX,
            -bounds.maxY,
            bounds.width,
            bounds.height
        )
        ctx.restore()
    }

}
