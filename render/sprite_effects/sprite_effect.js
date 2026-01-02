export default class SpriteEffect {

    static type = 'base'

    #enabled = true

    constructor (options = {}) {
        this.#enabled = options.enabled ?? true
    }


    get enabled () {
        return this.#enabled
    }


    set enabled (value) {
        this.#enabled = value
    }


    get type () {
        return this.constructor.type
    }


    getHints () { // eslint-disable-line local/class-methods-use-this -- clean
        return null
    }


    update () {

    }


    dispose () {

    }

}
