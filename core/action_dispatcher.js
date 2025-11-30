import PerkyModule from './perky_module'
import ActionController from './action_controller'


export default class ActionDispatcher extends PerkyModule {

    #activeControllerName = null
    #contextStack = []
    #useStackMode = false
    mainControllerName = null

    onInstall (host, options) {
        this.#setupMainController(options)

        host.delegate(this, {
            register: 'registerController',
            unregister: 'unregisterController',
            getController: 'getController',
            list: 'listControllers',
            setActive: 'setActiveController',
            getActive: 'getActiveController',
            push: 'pushContext',
            pop: 'popContext',
            getStack: 'getContextStack',
            clearStack: 'clearContextStack',
            isStackMode: 'isStackMode',
            dispatch: 'dispatchAction',
            listActions: 'listActions',
            mainController: 'mainController',
            addAction: 'addAction',
            removeAction: 'removeAction'
        })
    }


    #setupMainController (options) {
        const mainOption = options.main ?? true

        if (mainOption !== false) {
            const mainName = typeof mainOption === 'string' ? mainOption : 'main'
            this.mainControllerName = mainName

            this.register(mainName, ActionController)
            this.setActive(mainName)
        }
    }


    get mainController () {
        return this.getController(this.mainControllerName)
    }


    addAction (actionName, action) {
        return this.mainController?.addAction(actionName, action)
    }


    removeAction (actionName) {
        return this.mainController?.removeAction(actionName)
    }


    get activeController () {
        return this.getExtension(this.#activeControllerName)
    }


    getActiveName () {
        return this.#activeControllerName
    }


    register (name, ControllerClass) {
        if (this.hasExtension(name)) {
            console.warn(`Controller "${name}" already registered. Overwriting...`)
        }

        this.use(ControllerClass, {
            $name: name,
            $category: 'controller'
        })

        return this
    }


    unregister (name) {
        const controller = this.getExtension(name)

        if (!controller) {
            return false
        }

        if (this.#activeControllerName === name) {
            this.#activeControllerName = null
        }

        const stackIndex = this.#contextStack.indexOf(name)
        if (stackIndex !== -1) {
            this.#contextStack.splice(stackIndex, 1)
        }

        return this.removeExtension(name)
    }


    getController (name) {
        return this.getExtension(name)
    }


    getNameFor (controller) {
        return this.getExtensionsRegistry().keyFor(controller)
    }


    setActive (name) {
        if (!this.hasExtension(name)) {
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
        if (!this.hasExtension(name)) {
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
        const controller = this.getExtension(name)

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
        return this.getExtensionsByCategory('controller')
    }


    listAllActions () {
        const allActions = new Map()
        const registry = this.getExtensionsRegistry()

        for (const [name, controller] of registry.entries) {
            if (controller instanceof ActionController && typeof controller.listActions === 'function') {
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
        const registry = this.getExtensionsRegistry()

        for (let i = this.#contextStack.length - 1; i >= 0; i--) {
            const controllerName = this.#contextStack[i]
            const controller = registry.get(controllerName)

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
        const registry = this.getExtensionsRegistry()

        for (let i = startIndex; i >= 0; i--) {
            const controllerName = this.#contextStack[i]
            const controller = registry.get(controllerName)

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
