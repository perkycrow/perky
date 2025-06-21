import PerkyModule from '../core/perky_module'
import Registry from '../core/registry'
import InputBinding from './input_binding'


export default class InputBinder extends PerkyModule {

    #bindings = new Registry()

    constructor (bindings = []) {
        super()
        this.import(bindings)
    }


    import (bindings) {
        if (Array.isArray(bindings)) {
            bindings.forEach(bindingData => this.bind(bindingData))
        }
    }


    bind ({
        deviceName,
        controlName,
        actionName,
        controllerName = null,
        eventType = 'pressed'
    }) {
        const binding = new InputBinding({
            deviceName,
            controlName,
            actionName,
            controllerName,
            eventType
        })
        
        this.#bindings.set(binding.key, binding)

        return binding
    }


    unbind (params) {
        return this.#bindings.delete(keyFor(params))
    }


    getBinding (params) {
        return this.#bindings.get(keyFor(params)) || null
    }


    hasBinding (params) {
        return this.getBinding(params) !== null
    }


    getAllBindings () {
        return Array.from(this.#bindings.values)
    }


    clearBindings () {
        this.#bindings.clear()
    }


    export () {
        return {
            bindings: this.getAllBindings().map(binding => ({
                deviceName: binding.deviceName,
                controlName: binding.controlName,
                actionName: binding.actionName,
                controllerName: binding.controllerName,
                eventType: binding.eventType
            }))
        }
    }


    static import (data) {
        return new InputBinder(data.bindings || [])
    }

}


function keyFor ({actionName, controllerName = null, eventType = 'pressed'}) {
    return InputBinding.keyFor({actionName, controllerName, eventType})
}
