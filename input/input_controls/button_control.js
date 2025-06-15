import InputControl from '../input_control'


export default class ButtonControl extends InputControl {

    static defaultPressThreshold = 0.1


    constructor (params = {}) {
        super(params)

        this.pressThreshold = params.pressThreshold ?? this.constructor.defaultPressThreshold
    }


    setValue (value) {
        if (super.setValue(value)) {

            if (this.isPressed && !this.wasPressed) {
                this.emit('pressed')
            }

            if (!this.isPressed && this.wasPressed) {
                this.emit('released')
            }

            return true
        }

        return false
    }


    get isPressed () {
        return this.value >= this.pressThreshold
    }


    get wasPressed () {
        return this.oldValue >= this.pressThreshold
    }


    press () {
        this.setValue(1)
    }

    
    release () {
        this.setValue(0)
    }

}
