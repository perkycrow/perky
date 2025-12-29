import CanvasObjectRenderer from './canvas_object_renderer'
import Image2D from '../image_2d'


export default class CanvasImageRenderer extends CanvasObjectRenderer {

    static get handles () {
        return [Image2D]
    }


    render (image, ctx) { // eslint-disable-line class-methods-use-this
        if (image.image && image.image.complete) {
            const offsetX = -image.width * image.anchorX
            const offsetY = -image.height * image.anchorY

            ctx.save()
            ctx.scale(1, -1)
            ctx.drawImage(
                image.image,
                offsetX,
                -offsetY - image.height,
                image.width,
                image.height
            )
            ctx.restore()
        }
    }

}
