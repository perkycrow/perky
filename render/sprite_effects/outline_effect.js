import SpriteEffect from './sprite_effect.js'


export default class OutlineEffect extends SpriteEffect {

    static type = 'outline'

    #width = 0.02
    #color = [1, 1, 1, 1]

    constructor (options = {}) {
        super(options)

        if (options.width !== undefined) {
            this.#width = options.width
        }
        if (options.color !== undefined) {
            this.#color = options.color
        }
    }


    get width () {
        return this.#width
    }


    set width (value) {
        this.#width = value
    }


    get color () {
        return this.#color
    }


    set color (value) {
        this.#color = value
    }


    getHints () {
        return {
            width: this.#width,
            color: this.#color
        }
    }

}
