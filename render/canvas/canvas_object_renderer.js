export default class CanvasObjectRenderer {

    #context = null
    #collected = []

    static get handles () {
        return []
    }


    get ctx () {
        return this.#context?.ctx || null
    }


    get context () {
        return this.#context
    }


    init (context) {
        this.#context = context
    }


    reset () {
        this.#collected = []
    }


    collect (object, opacity, hints = null) {
        this.#collected.push({object, opacity, hints})
    }


    flush () {
        const ctx = this.ctx

        for (const {object, opacity, hints} of this.#collected) {
            ctx.save()

            const m = object.worldMatrix
            ctx.transform(m[0], m[1], m[2], m[3], m[4], m[5])

            ctx.globalAlpha = opacity

            if (hints?.filter) {
                ctx.filter = hints.filter
            }

            this.render(object, ctx, hints)

            ctx.restore()
        }
    }


    render () { // eslint-disable-line class-methods-use-this
    }


    dispose () {
        this.#collected = []
        this.#context = null
    }

}
