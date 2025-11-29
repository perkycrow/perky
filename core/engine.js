import PerkyModule from './perky_module'
import Manifest from './manifest'
import ActionDispatcher from './action_dispatcher'
import ActionController from './action_controller'


export default class Engine extends PerkyModule {

    constructor (params = {}) {
        const {manifest = {}, ...superParams} = params

        super({
            name: 'engine',
            ...superParams
        })

        this.use(Manifest, {
            $bind: 'manifest',
            $lifecycle: false,
            data: manifest instanceof Manifest ? manifest.export() : manifest
        })

        this.use(ActionDispatcher, {
            $bind: 'actionDispatcher'
        })

        this.use(ActionController, {
            $bind: 'applicationController',
            $lifecycle: false
        })

        this.actionDispatcher.register('application', this.applicationController)
        this.actionDispatcher.setActive('application')
    }


    registerController (name, controller) {
        return this.actionDispatcher.register(name, controller)
    }


    registerContext (name, controller) {
        return this.registerController(name, controller)
    }


    getController (name) {
        return this.actionDispatcher.getController(name) || null
    }


    unregisterController (name) {
        return this.actionDispatcher.unregister(name)
    }


    unregisterContext (name) {
        return this.unregisterController(name)
    }


    setActiveController (name) {
        return this.actionDispatcher.setActive(name)
    }


    activateContext (name) {
        return this.setActiveController(name)
    }


    getActiveController () {
        return this.actionDispatcher.getActive()
    }


    getActiveContext () {
        return this.actionDispatcher.getActiveName()
    }


    pushContext (name) {
        return this.actionDispatcher.push(name)
    }


    popContext () {
        return this.actionDispatcher.pop()
    }


    getContextStack () {
        return this.actionDispatcher.getStack()
    }


    clearContextStack () {
        return this.actionDispatcher.clearStack()
    }


    isStackMode () {
        return this.actionDispatcher.isStackMode()
    }


    addAction (actionName, action) {
        return this.applicationController.addAction(actionName, action)
    }


    removeAction (actionName) {
        return this.applicationController.removeAction(actionName)
    }


    dispatchAction (actionName, ...args) {
        return this.actionDispatcher.dispatch(actionName, ...args)
    }


    dispatch (actionName, ...args) {
        return this.dispatchAction(actionName, ...args)
    }


    listContexts () {
        return this.actionDispatcher.listControllers()
    }


    listActions (contextName = null) {
        if (contextName) {
            const controller = this.actionDispatcher.getController(contextName)
            return controller && typeof controller.listActions === 'function'
                ? controller.listActions()
                : []
        }

        return this.actionDispatcher.listAllActions()
    }


    eventToAction (eventName, actionName, ...args) {
        return this.on(eventName, this.actionCaller(actionName, ...args))
    }


    onceToAction (eventName, actionName, ...args) {
        return this.once(eventName, this.actionCaller(actionName, ...args))
    }


    actionCaller (actionName, ...args) {
        return () => this.dispatchAction(actionName, ...args)
    }


    addAlias (key, value) {
        return this.manifest.setAlias(key, value)
    }


    exportManifest (pretty = true) {
        return this.manifest.export(pretty)
    }


    importManifest (data) {
        return this.manifest.import(data)
    }

}
