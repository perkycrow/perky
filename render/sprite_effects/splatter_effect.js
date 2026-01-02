import SpriteEffect from './sprite_effect.js'


export default class SplatterEffect extends SpriteEffect {

    static type = 'splatter'

    #intensity = 0
    #pattern = 0
    #atlas = null

    constructor (options = {}) {
        super(options)

        if (options.intensity !== undefined) {
            this.#intensity = options.intensity
        }
        if (options.pattern !== undefined) {
            this.#pattern = options.pattern
        }
        if (options.atlas !== undefined) {
            this.#atlas = options.atlas
        }
    }


    get intensity () {
        return this.#intensity
    }


    set intensity (value) {
        this.#intensity = Math.max(0, Math.min(1, value))
    }


    get pattern () {
        return this.#pattern
    }


    set pattern (value) {
        this.#pattern = value
    }


    get atlas () {
        return this.#atlas
    }


    set atlas (value) {
        this.#atlas = value
    }


    getHints () {
        return {
            intensity: this.#intensity,
            pattern: this.#pattern,
            atlas: this.#atlas
        }
    }

}
