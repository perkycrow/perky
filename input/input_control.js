import Notifier from '../core/notifier'

const VALUE = Symbol('value')
const OLD_VALUE = Symbol('oldValue')


export default class InputControl extends Notifier {

    static VALUE = VALUE
    static OLD_VALUE = OLD_VALUE


    constructor ({device, name, value}) {
        super()
        this.device     = device
        this.name       = name
        this[OLD_VALUE] = null
        this[VALUE]     = value ?? this.getDefaultValue()
    }


    set value (value) {
        if (value === this[VALUE]) {
            return
        }

        this[OLD_VALUE] = this[VALUE]
        this[VALUE] = value

        this.emit('updated', this[VALUE], this[OLD_VALUE])
    }


    get value () {
        return this[InputControl.VALUE]
    }


    getDefaultValue () { // eslint-disable-line class-methods-use-this
        return 0
    }


    reset () {
        this.value = this.getDefaultValue()
    }

}
