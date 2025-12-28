import BaseCanvasLayer from './base_canvas_layer'
import WebGLCanvas2D from './webgl_canvas_2d'


export default class WebGLCanvasLayer extends BaseCanvasLayer {

    getRendererClass () { // eslint-disable-line class-methods-use-this
        return WebGLCanvas2D
    }

}
