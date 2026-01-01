
export default class RenderTransform {

    constructor (options = {}) {
        this.enabled = options.enabled ?? true
    }


    init () { // eslint-disable-line class-methods-use-this -- clean

    }


    apply (context, matrices) {// eslint-disable-line class-methods-use-this -- clean
        return matrices
    }


    getProgram () { // eslint-disable-line class-methods-use-this -- clean
        return null
    }


    applyUniforms () { // eslint-disable-line class-methods-use-this -- clean

    }


    dispose () { // eslint-disable-line class-methods-use-this -- clean

    }

}
