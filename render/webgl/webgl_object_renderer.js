export default class WebGLObjectRenderer {

    #gl = null
    #context = null


    static get handles () {
        return []
    }


    get gl () {
        return this.#gl
    }


    get context () {
        return this.#context
    }


    init (context) {
        this.#gl = context.gl
        this.#context = context
    }


    reset () {
        // Override in subclass
    }


    collect (object, opacity) {
        // Override in subclass
    }


    flush (matrices) {
        // Override in subclass
    }


    dispose () {
        this.#gl = null
        this.#context = null
    }

}
