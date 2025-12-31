export default class WebGLObjectRenderer {

    #gl = null
    #context = null
    #collected = []


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
        this.#collected = []
    }


    collect (object, opacity, hints = null) {
        this.#collected.push({object, opacity, hints})
    }


    get collected () {
        return this.#collected
    }


    flush (matrices, renderContext = null) { // eslint-disable-line no-unused-vars, class-methods-use-this
    }


    dispose () {
        this.#collected = []
        this.#gl = null
        this.#context = null
    }

}
