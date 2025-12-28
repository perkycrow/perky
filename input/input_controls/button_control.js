import InputControl from '../input_control'


export default class ButtonControl extends InputControl {

    static defaultPressThreshold = 0.1


    constructor (params = {}) {
        super(params)

        this.pressThreshold = params.pressThreshold ?? this.constructor.defaultPressThreshold
    }


    setValue (value, event = null) {
        this.lastEvent = event
        
        if (super.setValue(value, event)) {

            if (this.isPressed && !this.wasPressed) {
                this.emit('pressed', this.lastEvent)
            }

            if (!this.isPressed && this.wasPressed) {
                this.emit('released', this.lastEvent)
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


    press (event = null) {
        this.setValue(1, event)
    }

    
    release (event = null) {
        this.setValue(0, event)
    }

}
