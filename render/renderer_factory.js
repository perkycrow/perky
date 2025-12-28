import Canvas2D from './canvas_2d'
import WebGLCanvas2D from './webgl_canvas_2d'


const RENDERER_TYPES = {
    canvas: Canvas2D,
    webgl: WebGLCanvas2D
}


export default class RendererFactory {

    static getRendererClass (type) {
        const RendererClass = RENDERER_TYPES[type]
        if (!RendererClass) {
            throw new Error(`Unknown renderer type: "${type}". Available: ${Object.keys(RENDERER_TYPES).join(', ')}`)
        }
        return RendererClass
    }


    static isValidType (type) {
        return type in RENDERER_TYPES
    }


    static getAvailableTypes () {
        return Object.keys(RENDERER_TYPES)
    }

}
