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


    getHints () { // eslint-disable-line class-methods-use-this -- clean
        return null
    }


    update () { // eslint-disable-line class-methods-use-this -- clean

    }


    dispose () { // eslint-disable-line class-methods-use-this -- clean

    }

}
