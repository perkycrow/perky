export default class RenderContext {

    #type
    #canvas
    #ctx = null
    #gl = null
    #shaderRegistry = null
    #textureManager = null


    constructor (options) {
        this.#type = options.type
        this.#canvas = options.canvas

        if (this.#type === 'canvas') {
            this.#ctx = options.ctx
        } else {
            this.#gl = options.gl
            this.#shaderRegistry = options.shaderRegistry
            this.#textureManager = options.textureManager
        }
    }


    get type () {
        return this.#type
    }


    get canvas () {
        return this.#canvas
    }


    get ctx () {
        return this.#ctx
    }


    get gl () {
        return this.#gl
    }


    get shaderRegistry () {
        return this.#shaderRegistry
    }


    get textureManager () {
        return this.#textureManager
    }


    get isCanvas () {
        return this.#type === 'canvas'
    }


    get isWebGL () {
        return this.#type === 'webgl'
    }


    getShader (shaderId) {
        if (!this.isWebGL) {
            return null
        }
        return this.#shaderRegistry?.get(shaderId) || null
    }


    getDefaultShader (type) {
        if (!this.isWebGL) {
            return null
        }
        return this.#shaderRegistry?.getDefault(type) || null
    }

}
