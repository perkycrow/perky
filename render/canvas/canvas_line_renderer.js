import CanvasObjectRenderer from './canvas_object_renderer.js'
import Line from '../line.js'


export default class CanvasLineRenderer extends CanvasObjectRenderer {

    static get handles () {
        return [Line]
    }


    render (line, ctx) { // eslint-disable-line local/class-methods-use-this -- clean
        ctx.beginPath()
        ctx.moveTo(0, 0)
        ctx.lineTo(line.x2, line.y2)
        ctx.strokeStyle = line.color
        ctx.lineWidth = line.lineWidth
        ctx.stroke()
    }

}
