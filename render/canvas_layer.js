import BaseCanvasLayer from './base_canvas_layer'
import Canvas2D from './canvas_2d'


export default class CanvasLayer extends BaseCanvasLayer {

    getRendererClass () { // eslint-disable-line class-methods-use-this
        return Canvas2D
    }

}
