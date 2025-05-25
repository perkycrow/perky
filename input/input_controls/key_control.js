import InputControl from '../input_control'


export default class KeyControl extends InputControl {

    constructor (params = {}) {
        super({...params, defaultValue: 0})
    }


    getDefaultValue () { // eslint-disable-line class-methods-use-this
        return 0
    }


    setValue (value) {
        super.setValue(value ? 1 : 0)
    }


    isPressed () {
        return this.getValue() === 1
    }


    press () {
        this.setValue(1)
    }


    release () {
        this.setValue(0)
    }

}
