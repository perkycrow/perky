import PerkyModule from '../core/perky_module'
import Registry from '../core/registry'


export default class ActionController extends PerkyModule {

    static propagable = []

    #actions = new Registry()

    constructor (actions) {
        super()

        if (actions && typeof actions === 'object') {
            Object.keys(actions).forEach(actionName => {
                if (typeof actions[actionName] === 'function') {
                    this.addAction(actionName, actions[actionName])
                }
            })
        }
    }


    get engine () {
        return this.host?.engine
    }


    addAction (actionName, action) {
        return this.#actions.set(actionName, action)
    }


    getAction (actionName) {
        return this.#actions.get(actionName)
    }


    removeAction (actionName) {
        return this.#actions.delete(actionName)
    }


    hasAction (actionName) {
        return this.getAction(actionName) !== undefined || typeof this[actionName] === 'function'
    }


    shouldPropagate (actionName) {
        const ControllerClass = this.constructor
        return ControllerClass.propagable && Array.isArray(ControllerClass.propagable) 
            ? ControllerClass.propagable.includes(actionName)
            : false
    }


    listActions () { // eslint-disable-line complexity
        const actions = new Set()
        
        for (const actionName of this.#actions.keys) {
            actions.add(actionName)
        }
        
        const proto = Object.getPrototypeOf(this)
        const methods = Object.getOwnPropertyNames(proto)
        
        for (const method of methods) {
            if (method !== 'constructor' && 
                typeof this[method] === 'function' &&
                !method.startsWith('_') &&
                !method.startsWith('#') &&
                !isInternalMethod(method)) {
                actions.add(method)
            }
        }
        
        return Array.from(actions)
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

        if (typeof this[actionName] === 'function') {
            if (!this.emitCallbacks(`beforeAction:${actionName}`, ...args)) {
                return false
            }

            const result = this[actionName](...args)
            this.emitCallbacks(`afterAction:${actionName}`, ...args)

            return result
        }

        return false
    }

}


const INTERNAL_METHODS = new Set([
    'start', 'stop', 'dispose', 'use', 'on', 'once', 'off', 'emit', 
    'emitCallbacks', 'emitter', 'addAction', 'getAction', 'removeAction',
    'hasAction', 'shouldPropagate', 'listActions', 'addCallback',
    'beforeAction', 'afterAction', 'execute'
])

function isInternalMethod (methodName) {
    return INTERNAL_METHODS.has(methodName)
}
