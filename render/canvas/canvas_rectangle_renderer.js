import CanvasObjectRenderer from './canvas_object_renderer.js'
import Rectangle from '../rectangle.js'


export default class CanvasRectangleRenderer extends CanvasObjectRenderer {

    static get handles () {
        return [Rectangle]
    }


    render (rect, ctx) { // eslint-disable-line class-methods-use-this
        const offsetX = -rect.width * rect.anchorX
        const offsetY = -rect.height * rect.anchorY

        if (rect.color && rect.color !== 'transparent') {
            ctx.fillStyle = rect.color
            ctx.fillRect(offsetX, offsetY, rect.width, rect.height)
        }

        if (rect.strokeWidth > 0) {
            ctx.strokeStyle = rect.strokeColor
            ctx.lineWidth = rect.strokeWidth
            ctx.strokeRect(offsetX, offsetY, rect.width, rect.height)
        }
    }

}
