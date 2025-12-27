import PerkyModule from '../core/perky_module'
import Registry from '../core/registry'


export default class InputDevice extends PerkyModule {

    static $category = 'inputDevice'

    constructor (options = {}) {
        super(options)

        const {container = window} = options

        this.container = container
        this.controls = new Registry()
        this.pressedNames = new Set()

        this.#initEvents()
    }


    onInstall (host) {
        this.delegateEventsTo(host, ['control:pressed', 'control:released', 'control:updated'])
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


    getPressedControls () {
        const results = []
        for (const controlName of this.pressedNames) {
            const control = this.getControl(controlName)
            if (control) {
                results.push(control)
            }
        }
        return results
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


    shouldPreventDefaultFor (event, control) {
        if (!this.shouldPreventDefault) {
            return false
        }

        if (typeof this.shouldPreventDefault === 'function') {
            return this.shouldPreventDefault(event, control, this)
        }

        return true
    }


    preventDefault (event, control) {
        if (control && event && this.shouldPreventDefaultFor(event, control)) {
            if (typeof event.preventDefault === 'function') {
                event.preventDefault()
            }
            if (typeof event.stopPropagation === 'function') {
                event.stopPropagation()
            }
        }
    }


    #initEvents () {
        const device = this
        const controlListeners = new WeakMap()

        const createListeners = (control) => ({
            pressed (event) {
                device.pressedNames.add(control.name)
                device.emit('control:pressed', control, event, device)
                device.preventDefault(event, control)
            },
            released (event) {
                device.pressedNames.delete(control.name)
                device.emit('control:released', control, event, device)
                device.preventDefault(event, control)
            },
            updated (value, oldValue, event) {
                device.emit('control:updated', control, value, oldValue, event, device)
            }
        })

        this.controls.on('set', (key, control) => {
            const listeners = createListeners(control)
            controlListeners.set(control, listeners)

            control.on('pressed', listeners.pressed)
            control.on('released', listeners.released)
            control.on('updated', listeners.updated)
        })

        this.controls.on('delete', (key, control) => {
            const listeners = controlListeners.get(control)

            if (listeners) {
                control.off('pressed', listeners.pressed)
                control.off('released', listeners.released)
                control.off('updated', listeners.updated)

                controlListeners.delete(control)
            }

            device.pressedNames.delete(control.name)
        })
    }

}
