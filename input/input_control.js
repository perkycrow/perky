import Notifier from '../core/notifier.js'


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
        this.setValue(value)
    }


    setValue (value, event = null) {
        if (value === this[VALUE]) {
            return false
        }

        this[OLD_VALUE] = this[VALUE]
        this[VALUE] = value

        this.emit('updated', this[VALUE], this[OLD_VALUE], event)

        return true
    }


    get value () {
        return this[VALUE]
    }


    get oldValue () {
        return this[OLD_VALUE]
    }


    getDefaultValue () { // eslint-disable-line class-methods-use-this
        return 0
    }


    reset () {
        this.value = this.getDefaultValue()
    }

}
