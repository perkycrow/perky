import PerkyModule from './perky_module'
import ActionController from './action_controller'


export default class ActionDispatcher extends PerkyModule {

    #activeControllers = []
    mainControllerName = null

    onInstall (host, options) {
        this.#setupMainController(options)

        this.listenTo(host, 'input:triggered', this.dispatchAction.bind(this))

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
            execute: 'execute',
            executeTo: 'executeTo',
            dispatchAction: 'dispatchAction',
            listActions: 'listActions',
            mainController: 'mainController',
            addAction: 'addAction',
            removeAction: 'removeAction'
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

            this.register(mainName)
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


    register (name, Controller = ActionController) {
        return this.create(Controller, {
            $id: name,
            $category: 'controller'
        })

    }


    unregister (name) {
        const controller = this.getChild(name)

        if (!controller) {
            return false
        }

        const stackIndex = this.#activeControllers.indexOf(name)
        if (stackIndex !== -1) {
            this.#activeControllers.splice(stackIndex, 1)
        }

        return this.removeChild(name)
    }


    getController (name) {
        return this.getChild(name)
    }


    setActive (names) {
        const nameArray = Array.isArray(names) ? names : [names]

        for (const name of nameArray) {
            if (!this.hasChild(name)) {
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
        if (!this.hasChild(name)) {
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


    execute (actionName, ...args) {
        if (this.#activeControllers.length === 0) {
            console.warn('No active controllers')
            return
        }

        const registry = this.childrenRegistry

        for (let i = this.#activeControllers.length - 1; i >= 0; i--) {
            const controllerName = this.#activeControllers[i]
            const controller = registry.get(controllerName)

            if (!controller) {
                continue
            }

            const hasAction = controller.hasAction(actionName)

            controller.execute(actionName, ...args)

            if (hasAction && !controller.shouldPropagate(actionName)) {
                return
            }
        }
    }


    executeTo (name, actionName, ...args) {
        const controller = this.getController(name)

        if (controller && this.#isControllerActive(name)) {
            if (typeof controller.execute === 'function') {
                controller.execute(actionName, ...args)
            } else if (typeof controller[actionName] === 'function') {
                controller[actionName](...args)
            }
        }
    }


    dispatchAction (binding, ...args) {
        if (binding.controllerName) {
            this.executeTo(binding.controllerName, binding.actionName, ...args)
        } else {
            this.execute(binding.actionName, ...args)
        }
    }


    #isControllerActive (controllerName) {
        return this.#activeControllers.includes(controllerName)
    }


    listControllers () {
        return this.listNamesFor('controller')
    }


    listAllActions () {
        const allActions = new Map()
        const registry = this.childrenRegistry

        for (const [name, controller] of registry.entries) {
            if (typeof controller.listActions === 'function') {
                allActions.set(name, controller.listActions())
            }
        }

        return allActions
    }


}
