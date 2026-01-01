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


    flush () { // eslint-disable-line class-methods-use-this -- clean

    }


    dispose () {
        this.#collected = []
        this.#gl = null
        this.#context = null
    }

}
