import PerkyModule from '../core/perky_module'
import Registry from '../core/registry'
import InputBinding from './input_binding'
import CompositeBinding from './composite_binding'


export default class InputBinder extends PerkyModule {

    static $category = 'inputBinder'

    #bindings = new Registry()

    constructor (options = {}) {
        super(options)

        const {bindings = [], inputBinder} = options

        this.#bindings.addIndex('input', (binding) => {
            if (binding instanceof CompositeBinding) {
                return null
            }
            return `${binding.deviceName}:${binding.controlName}:${binding.eventType}`
        })

        this.#bindings.addIndex('action', (binding) => {
            const controller = binding.controllerName || ''
            return `${binding.actionName}:${binding.eventType}:${controller}`
        })

        this.#bindings.addIndex('actionAll', (binding) => {
            return `${binding.actionName}:${binding.eventType}`
        })

        if (inputBinder) {
            this.import(inputBinder)
        }
        this.import({bindings})
    }


    onInstall (host) {
        host.delegate(this, [
            'bind',
            'unbind',
            'getBinding',
            'hasBinding',
            'getBindingsForInput',
            'getBindingsForAction',
            'getAllBindings',
            'clearBindings',
            'bindCombo'
        ])
    }


    import (inputBinder) {
        if (typeof inputBinder.export === 'function') {
            inputBinder = inputBinder.export()
        }

        if (Array.isArray(inputBinder?.bindings)) {
            this.importBindings(inputBinder.bindings)
        }
    }


    importBindings (bindings) {
        bindings.forEach(bindingData => this.bind(bindingData))
    }


    bind ({
        deviceName,
        controlName,
        actionName,
        controllerName = null,
        eventType = 'pressed',
        controls = null
    }) {
        let binding

        if (controls && Array.isArray(controls)) {
            binding = new CompositeBinding({
                controls,
                actionName,
                controllerName,
                eventType
            })
        } else {
            binding = new InputBinding({
                deviceName,
                controlName,
                actionName,
                controllerName,
                eventType
            })
        }

        this.#bindings.set(binding.key, binding)
        return binding
    }


    unbind (params) {
        const binding = this.getBinding(params)

        if (binding) {
            this.#bindings.delete(binding.key)

            // Emit event for reactive indexing
            this.emit('binding:removed', binding)

            return true
        }
        return false
    }


    getBinding (params) {
        const {deviceName, controlName, actionName, controllerName = null, eventType = 'pressed'} = params

        if (deviceName && controlName) {
            const key = keyFor(params)
            return this.#bindings.get(key) || null
        }

        const bindings = this.getBindingsForAction(actionName, controllerName, eventType)
        return bindings.length > 0 ? bindings[0] : null
    }


    hasBinding (params) {
        return this.getBinding(params) !== null
    }


    getBindingsForInput ({deviceName, controlName, eventType}) {
        const key = `${deviceName}:${controlName}:${eventType}`
        const directBindings = this.#bindings.lookup('input', key)

        const compositeBindings = []
        for (const binding of this.#bindings.values) {
            if (binding instanceof CompositeBinding &&
                binding.matches({deviceName, controlName, eventType})) {
                compositeBindings.push(binding)
            }
        }

        return [...directBindings, ...compositeBindings]
    }


    getBindingsForAction (actionName, controllerName = null, eventType = 'pressed') {
        if (controllerName === null) {
            const key = `${actionName}:${eventType}`
            return this.#bindings.lookup('actionAll', key)
        }

        const controller = controllerName || ''
        const key = `${actionName}:${eventType}:${controller}`
        return this.#bindings.lookup('action', key)
    }


    getAllBindings () {
        return Array.from(this.#bindings.values)
    }


    clearBindings () {
        this.#bindings.clear()
    }


    bindCombo (controls, actionName, controllerName = null, eventType = 'pressed') {
        if (!Array.isArray(controls) || controls.length < 2) {
            throw new Error('Controls must be an array with at least 2 controls')
        }

        if (!actionName || typeof actionName !== 'string') {
            throw new Error('actionName is required and must be a string')
        }

        const normalizedControls = controls.map((control, index) => {
            if (typeof control === 'string') {
                const deviceName = detectDeviceFromControlName(control)
                return {deviceName, controlName: control}
            } else if (control && typeof control === 'object' && control.deviceName && control.controlName) {
                return control
            } else {
                throw new Error(`Control at index ${index} must be a string or object with deviceName and controlName properties`)
            }
        })

        return this.bind({
            controls: normalizedControls,
            actionName,
            controllerName,
            eventType
        })
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


    static import (params) {
        return new InputBinder(params)
    }


}


function keyFor ({deviceName, controlName, actionName, controllerName = null, eventType = 'pressed'}) {
    return InputBinding.keyFor({deviceName, controlName, actionName, controllerName, eventType})
}





const MOUSE_CONTROLS = [
    'leftButton', 'rightButton', 'middleButton', 'backButton', 'forwardButton',
    'position', 'navigation'
]

const GAMEPAD_CONTROL_PATTERNS = [
    /^button\d+$/, /^axis\d+$/, /^dpad/, /^stick/
]

function detectDeviceFromControlName (controlName) {
    if (MOUSE_CONTROLS.includes(controlName)) {
        return 'mouse'
    }

    if (GAMEPAD_CONTROL_PATTERNS.some(pattern => pattern.test(controlName))) {
        return 'gamepad'
    }

    return 'keyboard'
}
