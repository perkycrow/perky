import PerkyModule from './perky_module'
import ModuleRegistry from './module_registry'
import InputBinder from '../input/input_binder'
import InputManager from '../input/input_manager'


export default class ActionDispatcher extends PerkyModule {

    #controllers
    #activeControllerName = null
    #inputBinder = null
    #inputManager = null

    constructor ({inputManager, inputBinder} = {}) {
        super()
        this.#controllers = new ModuleRegistry({
            registryName: 'controller',
            parentModule: this,
            parentModuleName: 'actionDispatcher'
        })

        this.#initInputBinder(inputBinder)
        this.#initInputManager(inputManager)
    }


    get activeController () {
        return this.#controllers.get(this.#activeControllerName)
    }


    get inputManager () {
        return this.#inputManager
    }


    get inputBinder () {
        return this.#inputBinder
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


    registerDevice (name, device) {
        return this.#inputManager ? this.#inputManager.registerDevice(name, device) : false
    }


    getDevice (name) {
        return this.#inputManager ? this.#inputManager.getDevice(name) : undefined
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
        return this.#inputManager ? this.#inputManager.deviceKeyFor(device) : undefined
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


    dispose () {
        this.#disconnectInputManager()
        return super.dispose()
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


    #initInputBinder (inputBinder) {
        if (inputBinder && typeof inputBinder === 'object' && !(inputBinder instanceof InputBinder)) {
            this.#inputBinder = new InputBinder(inputBinder)
        } else if (inputBinder instanceof InputBinder) {
            this.#inputBinder = inputBinder
        } else {
            this.#inputBinder = new InputBinder()
        }
    }


    #initInputManager (inputManager) {
        if (inputManager === false) {
            this.#inputManager = null
        } else if (inputManager && typeof inputManager === 'object' && !(inputManager instanceof InputManager)) {
            this.#inputManager = new InputManager(inputManager)
            this.#setupInputListeners()
        } else if (inputManager instanceof InputManager) {
            this.connectInputManager(inputManager)
        } else {
            this.#inputManager = new InputManager()
            this.#setupInputListeners()
        }
    }

}
