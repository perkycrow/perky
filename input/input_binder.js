import PerkyModule from '../core/perky_module'
import Registry from '../core/registry'
import InputBinding from './input_binding'


export default class InputBinder extends PerkyModule {

    #bindings = new Registry()
    #inputIndex = new Map()

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
        this.#addToInputIndex(binding)

        return binding
    }


    unbind (params) {
        const key = keyFor(params)
        const binding = this.#bindings.get(key)
        
        if (binding) {
            this.#removeFromInputIndex(binding)
            return this.#bindings.delete(key)
        }
        
        return false
    }


    getBinding (params) {
        return this.#bindings.get(keyFor(params)) || null
    }


    hasBinding (params) {
        return this.getBinding(params) !== null
    }


    getBindingsForInput ({deviceName, controlName, eventType}) {
        const inputKey = buildInputKey(deviceName, controlName, eventType)
        return this.#inputIndex.get(inputKey) || []
    }


    getAllBindings () {
        return Array.from(this.#bindings.values)
    }


    clearBindings () {
        this.#bindings.clear()
        this.#inputIndex.clear()
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


    #addToInputIndex (binding) {
        const inputKey = buildInputKey(binding.deviceName, binding.controlName, binding.eventType)
        
        if (!this.#inputIndex.has(inputKey)) {
            this.#inputIndex.set(inputKey, [])
        }
        
        this.#inputIndex.get(inputKey).push(binding)
    }


    #removeFromInputIndex (binding) {
        const inputKey = buildInputKey(binding.deviceName, binding.controlName, binding.eventType)
        const bindings = this.#inputIndex.get(inputKey)
        
        if (bindings) {
            const index = bindings.indexOf(binding)
            if (index !== -1) {
                bindings.splice(index, 1)
                
                if (bindings.length === 0) {
                    this.#inputIndex.delete(inputKey)
                }
            }
        }
    }

}


function keyFor ({actionName, controllerName = null, eventType = 'pressed'}) {
    return InputBinding.keyFor({actionName, controllerName, eventType})
}


function buildInputKey (deviceName, controlName, eventType) {
    return `${deviceName}:${controlName}:${eventType}`
}
