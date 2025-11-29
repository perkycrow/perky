import PerkyModule from './perky_module'
import Manifest from './manifest'
import ActionDispatcher from './action_dispatcher'
import ActionController from './action_controller'


export default class Engine extends PerkyModule {

    constructor (params = {}) {
        const {manifest = {}} = params

        super({
            name: 'engine',
            ...params
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


    addAction (actionName, action) {
        return this.applicationController.addAction(actionName, action)
    }


    removeAction (actionName) {
        return this.applicationController.removeAction(actionName)
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
