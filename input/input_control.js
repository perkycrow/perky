
export default class InputControl {


    constructor ({device, name, defaultValue}) {
        this.device = device
        this.name = name
        this.value = defaultValue || this.getDefaultValue()
    }


    setValue (value) {
        this.value = value
    }


    getValue () {
        return this.value
    }


    getDefaultValue () { // eslint-disable-line class-methods-use-this
        return 0
    }


    reset () {
        this.setValue(this.getDefaultValue())
    }

}
