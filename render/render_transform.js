
export default class RenderTransform {

    constructor (options = {}) {
        this.enabled = options.enabled ?? true
    }


    init () {

    }


    apply (context, matrices) {// eslint-disable-line local/class-methods-use-this -- clean
        return matrices
    }


    getProgram () { // eslint-disable-line local/class-methods-use-this -- clean
        return null
    }


    applyUniforms () {

    }


    dispose () {

    }

}
