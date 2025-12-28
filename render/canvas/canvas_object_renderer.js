export default class CanvasObjectRenderer {

    #ctx = null


    static get handles () {
        return []
    }


    get ctx () {
        return this.#ctx
    }


    init (ctx) {
        this.#ctx = ctx
    }


    render (object, ctx) {
        // Override in subclass
    }


    dispose () {
        this.#ctx = null
    }

}
