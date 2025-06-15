import PerkyModule from '../core/perky_module'
import Registry from '../core/registry'


export default class InputDevice extends PerkyModule {

    constructor ({container = window, name} = {}) {
        super()

        this.container    = container
        this.name         = name || this.constructor.name
        this.controls     = new Registry()
        this.pressedNames = new Set()

        this.#initEvents()
    }


    registerControl (control) {
        if (!(control && control.name)) {
            throw new Error('Control must have a name')
        }

        if (this.controls.has(control.name)) {
            return false
        }

        this.controls.set(control.name, control)

        return true
    }


    getControl (name) {
        return this.controls.get(name)
    }


    getValueFor (controlName) {
        const control = this.getControl(controlName)
        return control ? control.value : undefined
    }


    isPressed (controlName) {
        return this.pressedNames.has(controlName)
    }


    findOrCreateControl (Control, params = {}) {
        const controlName = params.name

        if (!controlName) {
            throw new Error('Control must have a name')
        }

        let control = this.controls.get(controlName)

        if (control) {
            return control
        }

        control = new Control({
            device: this,
            name: controlName,
            ...params
        })

        if (this.registerControl(control)) {
            return control
        }

        return null
    }


    #initEvents () {
        const device = this

        const listeners = {
            pressed () {
                device.pressedNames.add(this.name)
                device.emit('control:pressed', this)
            },
            released () {
                device.pressedNames.delete(this.name)
                device.emit('control:released', this)
            },
            updated (value, oldValue) {
                device.emit('control:updated', this, value, oldValue)
            }
        }

        this.controls.on('set', (key, control) => {
            control.on('pressed',  listeners.pressed.bind(control))
            control.on('released', listeners.released.bind(control))
            control.on('updated',  listeners.updated.bind(control))
        })

        this.controls.on('delete', (key, control) => {
            control.off('pressed',  listeners.pressed)
            control.off('released', listeners.released)
            control.off('updated',  listeners.updated)

            device.pressedNames.delete(control.name)
        })
    }

}
