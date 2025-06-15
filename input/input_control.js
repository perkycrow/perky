import Notifier from '../core/notifier'


export default class InputControl extends Notifier {


    constructor ({device, name, value}) {
        super()
        this.device = device
        this.name   = name
        this.value  = value ?? this.getDefaultValue()
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
