import CanvasObjectRenderer from './canvas_object_renderer.js'
import Circle from '../circle.js'


export default class CanvasCircleRenderer extends CanvasObjectRenderer {

    static get handles () {
        return [Circle]
    }


    render (circle, ctx) { // eslint-disable-line local/class-methods-use-this -- clean
        const offsetX = -circle.radius * 2 * circle.anchorX + circle.radius
        const offsetY = -circle.radius * 2 * circle.anchorY + circle.radius

        ctx.beginPath()
        ctx.arc(offsetX, offsetY, circle.radius, 0, Math.PI * 2)
        ctx.fillStyle = circle.color
        ctx.fill()

        if (circle.strokeWidth > 0) {
            ctx.strokeStyle = circle.strokeColor
            ctx.lineWidth = circle.strokeWidth
            ctx.stroke()
        }
    }

}
