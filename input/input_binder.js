import PerkyModule from '../core/perky_module'
import Registry from '../core/registry'
import InputBinding from './input_binding'


export default class InputBinder extends PerkyModule {

    #bindings = new Registry()

    constructor ({inputManager, actionDispatcher} = {}) {
        super()
        this.inputManager = inputManager
        this.actionDispatcher = actionDispatcher

        if (this.inputManager) {
            this.#initInputEvents()
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


    unbind ({actionName, controllerName = null, eventType = 'pressed'}) {
        const binding = new InputBinding({
            deviceName: '',
            controlName: '',
            actionName,
            controllerName,
            eventType
        })

        return this.#bindings.delete(binding.key)
    }


    getBinding ({actionName, controllerName = null, eventType = 'pressed'}) {
        const binding = new InputBinding({
            deviceName: '',
            controlName: '',
            actionName,
            controllerName,
            eventType
        })

        return this.#bindings.get(binding.key)
    }


    hasBinding ({actionName, controllerName = null, eventType = 'pressed'}) {
        return this.getBinding({actionName, controllerName, eventType}) !== undefined
    }


    findBindingByInput ({deviceName, controlName, eventType = 'pressed'}) {

        for (const binding of this.#bindings.values) {
            if (binding.matches({deviceName, controlName, eventType})) {
                return binding
            }
        }

        return null
    }


    rebindAction ({
        actionName,
        controllerName = null,
        eventType = 'pressed',
        deviceName,
        controlName
    }) {
        const binding = this.getBinding({actionName, controllerName, eventType})

        if (binding) {
            binding.updateInput({deviceName, controlName})
            return true
        }

        return false
    }


    getAllBindings () {
        return Array.from(this.#bindings.values)
    }


    clearBindings () {
        this.#bindings.clear()
    }


    getActiveControllerName () {
        return this.actionDispatcher ? this.actionDispatcher.getActiveName() : null
    }


    dispose () {
        this.clearBindings()

        return super.dispose()
    }


    #initInputEvents () {
        this.inputManager.on('control:pressed', (control, event, device) => {
            this.#handleControlEvent(control, event, device, 'pressed')
        })

        this.inputManager.on('control:released', (control, event, device) => {
            this.#handleControlEvent(control, event, device, 'released')
        })

        this.inputManager.on('control:updated', (...args) => {
            const [control, , , event, device] = args
            this.#handleControlEvent(control, event, device, 'updated')
        })
    }


    #handleControlEvent (control, event, device, eventType) {
        if (!this.actionDispatcher) {
            return
        }

        const deviceName = this.inputManager.deviceKeyFor(device)
        const activeControllerName = this.getActiveControllerName()

        let binding = this.#findBindingByInputAndController(deviceName, control.name, eventType, activeControllerName)

        if (!binding) {
            binding = this.#findBindingByInputAndController(deviceName, control.name, eventType, null)
        }

        if (binding) {
            const targetController = binding.controllerName || activeControllerName
            
            if (targetController) {
                this.actionDispatcher.dispatchTo(targetController, binding.actionName, control, event, device)
            }
        }
    }


    #findBindingByInputAndController (deviceName, controlName, eventType, controllerName) {
        for (const binding of this.#bindings.values) {
            if (binding.matches(deviceName, controlName, eventType) &&
                binding.controllerName === controllerName) {

                return binding
            }
        }

        return null
    }

}
