import PerkyModule from './perky_module'
import Registry from './registry'
import ActionController from './action_controller'


export default class ActionDispatcher extends PerkyModule {

    #controllers = null
    #activeControllerName = null

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
            return this.dispatchTo(targetController, binding.actionName, ...args)
        } else {
            return this.dispatch(binding.actionName, ...args)
        }
    }

}
