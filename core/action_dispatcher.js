import PerkyModule from './perky_module'
import ModuleRegistry from './module_registry'
import InputBinder from '../input/input_binder'


export default class ActionDispatcher extends PerkyModule {

    #controllers
    #activeControllerName = null
    #inputBinder = new InputBinder()
    #inputManager = null

    constructor () {
        super()
        this.#controllers = new ModuleRegistry({
            registryName: 'controller',
            parentModule: this,
            parentModuleName: 'actionDispatcher'
        })
    }


    get activeController () {
        return this.#controllers.get(this.#activeControllerName)
    }


    getActiveName () {
        return this.#activeControllerName
    }


    connectInputManager (inputManager) {
        if (this.#inputManager) {
            this.#disconnectInputManager()
        }

        this.#inputManager = inputManager
        this.#setupInputListeners()
        return this
    }


    disconnectInputManager () {
        this.#disconnectInputManager()
        return this
    }


    bind (bindingData) {
        return this.#inputBinder.bind(bindingData)
    }


    unbind (params) {
        return this.#inputBinder.unbind(params)
    }


    getBinding (params) {
        return this.#inputBinder.getBinding(params)
    }


    hasBinding (params) {
        return this.#inputBinder.hasBinding(params)
    }


    getBindingsForInput (params) {
        return this.#inputBinder.getBindingsForInput(params)
    }


    getAllBindings () {
        return this.#inputBinder.getAllBindings()
    }


    clearBindings () {
        return this.#inputBinder.clearBindings()
    }


    deviceKeyFor (device) {
        return this.#inputManager ? this.#inputManager.deviceKeyFor(device) : null
    }


    register (name, controller) {
        if (this.#controllers.has(name)) {
            console.warn(`Controller "${name}" already registered. Overwriting...`)
        }

        this.#controllers.set(name, controller)

        return this
    }


    unregister (name) {
        if (!this.#controllers.has(name)) {
            return false
        }

        const controller = this.#controllers.get(name)
        this.#controllers.delete(name)

        if (controller && controller.dispatcher) {
            delete controller.dispatcher
        }

        if (this.#activeControllerName === name) {
            this.#activeControllerName = null
        }

        return true
    }


    getController (name) {
        return this.#controllers.get(name)
    }


    getNameFor (controller) {
        return this.#controllers.keyFor(controller)
    }


    setActive (name) {
        if (!this.#controllers.has(name)) {
            console.warn(`Controller "${name}" not found. Cannot set as active controller.`)
            return false
        }

        this.#activeControllerName = name

        return true
    }


    getActive () {
        return this.activeController
    }


    dispatch (actionName, ...args) {
        if (!this.#activeControllerName) {
            console.warn('No active controller set for action dispatch')
            return false
        }

        return this.dispatchTo(this.#activeControllerName, actionName, ...args)
    }


    dispatchTo (name, actionName, ...args) {
        const controller = this.#controllers.get(name)

        if (controller) {

            if  (typeof controller.execute === 'function') {
                controller.execute(actionName, ...args)

                return true
            } else if (typeof controller[actionName] === 'function') {
                controller[actionName](...args)

                return true
            }

            return false
        }

        return false
    }


    dispatchAction (binding, control, ...args) {
        const targetController = binding.controllerName || this.#activeControllerName
        
        if (targetController) {
            return this.dispatchTo(targetController, binding.actionName, control, ...args)
        } else {
            return this.dispatch(binding.actionName, control, ...args)
        }
    }


    #setupInputListeners () {
        if (!this.#inputManager) {
            return
        }

        this.#inputManager.on('control:pressed', this.#handleInputEvent.bind(this, 'pressed'))
        this.#inputManager.on('control:released', this.#handleInputEvent.bind(this, 'released'))
    }


    #disconnectInputManager () {
        if (!this.#inputManager) {
            return
        }

        this.#inputManager.off('control:pressed', this.#handleInputEvent)
        this.#inputManager.off('control:released', this.#handleInputEvent)
        this.#inputManager = null
    }


    #handleInputEvent (eventType, control, event, device) {
        if (!this.#inputManager) {
            return
        }

        const deviceName = this.deviceKeyFor(device)
        const matchingBindings = this.getBindingsForInput({
            deviceName, 
            controlName: control.name, 
            eventType
        })
        
        matchingBindings.forEach(binding => {
            this.dispatchAction(binding, control, event, device)
        })
    }

}
