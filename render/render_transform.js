
export default class RenderTransform {

    constructor (options = {}) {
        this.enabled = options.enabled ?? true
    }


    init () { // eslint-disable-line class-methods-use-this

    }


    apply (context, matrices) {// eslint-disable-line class-methods-use-this
        return matrices
    }


    getProgram () { // eslint-disable-line class-methods-use-this
        return null
    }


    applyUniforms () { // eslint-disable-line class-methods-use-this

    }


    dispose () { // eslint-disable-line class-methods-use-this

    }

}
