
export default class InputControl {

    #device = null
    #name = null
    #displayName = null


    constructor ({device, name, displayName, defaultValue}) {
        this.#device = device
        this.#name = name
        this.#displayName = displayName || name
        this.value = defaultValue || this.getDefaultValue()
    }


    get name () {
        return this.#name
    }


    get displayName () {
        return this.#displayName
    }


    get device () {
        return this.#device
    }


    getValue () {
        return this.value
    }


    setValue (value) {
        this.value = value
    }


    reset () {
        this.setValue(this.getDefaultValue())
    }


    getDefaultValue () { // eslint-disable-line class-methods-use-this
        return null
    }

}
