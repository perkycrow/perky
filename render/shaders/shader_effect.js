export default class ShaderEffect {

    static shader = {
        params: [],
        uniforms: [],
        fragment: ''
    }

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
        return this.constructor.name
    }


    getParams () {
        const {params} = this.constructor.shader
        return params.map(name => this[name] ?? 0)
    }


    getHints () { // eslint-disable-line local/class-methods-use-this -- clean
        return null
    }


    update () {

    }


    dispose () {

    }

}
