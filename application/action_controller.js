import PerkyModule from '../core/perky_module'
import Registry from '../core/registry'


export default class ActionController extends PerkyModule {

    constructor () {
        super()

        this.actions = new Registry()
    }


    addAction (actionName, action) {
        return this.actions.set(actionName, action)
    }


    getAction (actionName) {
        return this.actions.get(actionName)
    }


    removeAction (actionName) {
        return this.actions.delete(actionName)
    }


    addCallback (callbackName, actionName, callback) {
        this.on(`${callbackName}Action:${actionName}`, callback)
    }


    beforeAction (actionName, callback) {
        return this.addCallback('before', actionName, callback)
    }


    afterAction (actionName, callback) {
        return this.addCallback('after', actionName, callback)
    }


    execute (actionName, ...args) {
        const action = this.getAction(actionName)

        if (action) {
            if (!this.emitCallbacks(`beforeAction:${actionName}`, ...args)) {
                return false
            }

            const result = action(...args)
            this.emitCallbacks(`afterAction:${actionName}`, ...args)

            return result
        }

        return false
    }

}
