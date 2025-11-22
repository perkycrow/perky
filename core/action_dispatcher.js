import PerkyModule from './perky_module'
import Registry from './registry'
import ActionController from './action_controller'


export default class ActionDispatcher extends PerkyModule {

    #controllers = null
    #activeControllerName = null
    #contextStack = []
    #useStackMode = false

    constructor () {
        super()
        this.#controllers = new Registry()
    }


    get activeController () {
        return this.#controllers.get(this.#activeControllerName)
    }


    getActiveName () {
        return this.#activeControllerName
    }


    register (name, controller) {
        if (this.#controllers.has(name)) {
            console.warn(`Controller "${name}" already registered. Overwriting...`)
        }

        if (!(controller instanceof ActionController) && controller?.constructor === Object) {
            controller = new ActionController(controller)
        }

        controller.host = this
        this.#controllers.set(name, controller)

        if (this.started) {
            controller.start()
        }

        this.on('start', () => controller.start())
        this.on('stop', () => controller.stop())
        this.on('dispose', () => {
            this.#controllers.delete(name)
            controller.dispose()
        })

        this.emit('controller:set', name, controller)
        controller.emit('registered', this, name)

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

        const stackIndex = this.#contextStack.indexOf(name)
        if (stackIndex !== -1) {
            this.#contextStack.splice(stackIndex, 1)
        }

        this.emit('controller:delete', name, controller)
        controller.emit('unregistered', this, name)
        controller.dispose()

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
        this.emit('context:activated', name)

        return true
    }


    getActive () {
        return this.activeController
    }


    enableStackMode () {
        this.#useStackMode = true
        
        if (this.#activeControllerName && !this.#contextStack.includes(this.#activeControllerName)) {
            this.#contextStack.push(this.#activeControllerName)
        }
        
        this.emit('stackMode:enabled')
    }


    disableStackMode () {
        this.#useStackMode = false
        this.#activeControllerName = this.#contextStack[this.#contextStack.length - 1] || null
        this.#contextStack = []
        
        this.emit('stackMode:disabled')
    }


    isStackMode () {
        return this.#useStackMode
    }


    push (name) {
        if (!this.#controllers.has(name)) {
            console.warn(`Context "${name}" not found`)
            return false
        }
        
        if (this.#contextStack.length > 0 && this.#contextStack[this.#contextStack.length - 1] === name) {
            return false
        }
        
        if (!this.#useStackMode) {
            this.enableStackMode()
        }
        
        this.#contextStack.push(name)
        this.emit('context:pushed', name, this.#contextStack.length)
        
        return true
    }


    pop () {
        if (this.#contextStack.length === 0) {
            console.warn('Context stack is empty')
            return null
        }
        
        const popped = this.#contextStack.pop()
        this.emit('context:popped', popped, this.#contextStack.length)
        
        if (this.#contextStack.length === 0) {
            this.disableStackMode()
        }
        
        return popped
    }


    getStack () {
        if (this.#useStackMode) {
            return [...this.#contextStack]
        } else if (this.#activeControllerName) {
            return [this.#activeControllerName]
        } else {
            return []
        }
    }


    clearStack () {
        this.#contextStack = []
        this.#useStackMode = false
        this.emit('stack:cleared')
    }


    dispatch (actionName, ...args) {
        if (this.#useStackMode) {
            return this.#dispatchWithStack(actionName, ...args)
        } else {
            return this.#dispatchSingle(actionName, ...args)
        }
    }


    dispatchTo (name, actionName, ...args) {
        const controller = this.#controllers.get(name)

        if (controller) {
            if (typeof controller.execute === 'function') {
                return controller.execute(actionName, ...args)
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
            if (!this.#isControllerActive(targetController)) {
                return false
            }
            
            return this.dispatchTo(targetController, binding.actionName, ...args)
        } else {
            return this.dispatch(binding.actionName, ...args)
        }
    }
    
    
    #isControllerActive (controllerName) {
        if (this.#useStackMode) {
            return this.#contextStack.includes(controllerName)
        } else {
            return this.#activeControllerName === controllerName
        }
    }


    listControllers () {
        return Array.from(this.#controllers.keys)
    }


    listAllActions () {
        const allActions = new Map()
        
        for (const [name, controller] of this.#controllers.entries) {
            if (controller && typeof controller.listActions === 'function') {
                allActions.set(name, controller.listActions())
            }
        }
        
        return allActions
    }


    #dispatchSingle (actionName, ...args) {
        if (!this.#activeControllerName) {
            console.warn('No active context')
            return false
        }
        
        return this.dispatchTo(this.#activeControllerName, actionName, ...args)
    }


    #dispatchWithStack (actionName, ...args) {
        for (let i = this.#contextStack.length - 1; i >= 0; i--) {
            const controllerName = this.#contextStack[i]
            const controller = this.#controllers.get(controllerName)
            
            if (!controller) {
                continue
            }
            
            const hasAction = controller.hasAction(actionName)
            
            if (hasAction) {
                const result = controller.execute(actionName, ...args)
                
                if (!controller.shouldPropagate(actionName)) {
                    return result
                }
            } else {
                const canPropagate = this.#canPropagateFromLowerContexts(actionName, i - 1)
                
                if (!canPropagate) {
                    return false
                }
            }
        }
        
        return false
    }
    
    
    #canPropagateFromLowerContexts (actionName, startIndex) {
        for (let i = startIndex; i >= 0; i--) {
            const controllerName = this.#contextStack[i]
            const controller = this.#controllers.get(controllerName)
            
            if (!controller) {
                continue
            }
            
            if (controller.hasAction(actionName) && controller.shouldPropagate(actionName)) {
                return true
            }
        }
        
        return false
    }

}
