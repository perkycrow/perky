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
            data: manifest.export ? manifest.export() : manifest
        })

        this.use(ActionDispatcher, {
            $bind: 'actionDispatcher'
        })
    }


    get mainController () {
        return this.actionDispatcher.mainController
    }


    addAction (actionName, action) {
        return this.mainController.addAction(actionName, action)
    }


    removeAction (actionName) {
        return this.mainController.removeAction(actionName)
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

}
