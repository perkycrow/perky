import FloatControl from './float_control'


export default class ButtonControl extends FloatControl {

    pressThreshold = 0.5


    constructor (params = {}) {
        super({
            ...params, 
            normalize: true,
            range: {min: 0, max: 1}
        })
        this.pressThreshold = params.pressThreshold ?? 0.5
    }


    isPressed () {
        return this.getValue() > this.pressThreshold
    }


    press () {
        this.setValue(1.0)
    }


    release () {
        this.setValue(0.0)
    }

}
