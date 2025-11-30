import PerkyModule from './perky_module'
import ActionController from './action_controller'


export default class ActionDispatcher extends PerkyModule {

    #activeControllers = []
    mainControllerName = null

    onInstall (host, options) {
        this.#setupMainController(options)

        host.delegate(this, {
            register: 'registerController',
            unregister: 'unregisterController',
            getController: 'getController',
            list: 'listControllers',
            setActive: 'setActiveControllers',
            getActive: 'getActiveControllers',
            pushActive: 'pushActiveController',
            popActive: 'popActiveController',
            clearActive: 'clearActiveControllers',
            dispatch: 'dispatchAction',
            listActions: 'listActions',
            mainController: 'mainController',
            addAction: 'addAction',
            removeAction: 'removeAction',
            setContext: 'setContext',
            clearContext: 'clearContext',
            setContextFor: 'setContextFor',
            clearContextFor: 'clearContextFor'
        })
    }


    get engine () {
        return this.host
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


    setContext (newContext, value) {
        return this.mainController?.setContext(newContext, value)
    }


    clearContext (key) {
        return this.mainController?.clearContext(key)
    }


    setContextFor (controllerName, newContext, value) {
        const controller = this.getController(controllerName)

        if (controller) {
            return controller.setContext(newContext, value)
        }

        return null
    }


    clearContextFor (controllerName, key) {
        const controller = this.getController(controllerName)

        if (controller) {
            return controller.clearContext(key)
        }

        return null
    }


    get activeControllers () {
        return this.#activeControllers.map(name => this.getExtension(name)).filter(Boolean)
    }


    getActiveNames () {
        return [...this.#activeControllers]
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

        // Remove from active controllers stack
        const stackIndex = this.#activeControllers.indexOf(name)
        if (stackIndex !== -1) {
            this.#activeControllers.splice(stackIndex, 1)
        }

        return this.removeExtension(name)
    }


    getController (name) {
        return this.getExtension(name)
    }


    getNameFor (controller) {
        return this.getExtensionsRegistry().keyFor(controller)
    }


    setActive (names) {
        const nameArray = Array.isArray(names) ? names : [names]

        for (const name of nameArray) {
            if (!this.hasExtension(name)) {
                console.warn(`Controller "${name}" not found. Cannot set as active controller.`)
                return false
            }
        }

        this.#activeControllers = [...nameArray]
        this.emit('controllers:activated', nameArray)

        return true
    }


    getActive () {
        return [...this.#activeControllers]
    }


    pushActive (name) {
        if (!this.hasExtension(name)) {
            console.warn(`Controller "${name}" not found`)
            return false
        }

        if (this.#activeControllers.length > 0 && this.#activeControllers[this.#activeControllers.length - 1] === name) {
            return false
        }

        this.#activeControllers.push(name)
        this.emit('controller:pushed', name, this.#activeControllers.length)

        return true
    }


    popActive () {
        if (this.#activeControllers.length === 0) {
            console.warn('Active controllers stack is empty')
            return null
        }

        const popped = this.#activeControllers.pop()
        this.emit('controller:popped', popped, this.#activeControllers.length)

        return popped
    }


    clearActive () {
        this.#activeControllers = []
        this.emit('controllers:cleared')
    }


    dispatch (actionName, ...args) {
        return this.#dispatchAction(actionName, ...args)
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
        const targetController = binding.controllerName

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
        return this.#activeControllers.includes(controllerName)
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


    #dispatchAction (actionName, ...args) { // eslint-disable-line complexity
        if (this.#activeControllers.length === 0) {
            console.warn('No active controllers')
            return false
        }

        const registry = this.getExtensionsRegistry()

        for (let i = this.#activeControllers.length - 1; i >= 0; i--) {
            const controllerName = this.#activeControllers[i]
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
                const canPropagate = this.#canPropagate(actionName, i - 1)

                if (!canPropagate) {
                    return false
                }
            }
        }

        return false
    }


    #canPropagate (actionName, startIndex) {
        const registry = this.getExtensionsRegistry()

        for (let i = startIndex; i >= 0; i--) {
            const controllerName = this.#activeControllers[i]
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
