import PerkyModule from './perky_module'
import ModuleRegistry from './module_registry'


export default class ActionDispatcher extends PerkyModule {

    #controllers
    #activeControllerName = null

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

}
