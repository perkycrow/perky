import PerkyModule from '../core/perky_module'
import Registry from '../core/registry'


export default class ActionController extends PerkyModule {

    static propagable = []

    #actions = new Registry()

    constructor (actions) {
        super()

        this.context = {}

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


    get (key) {
        return this.context[key]
    }


    set (key, value) {
        this.context[key] = value
        return this.context[key]
    }


    setContext (newContext, value) {
        if (typeof newContext === 'string') {
            this.context[newContext] = value
        } else if (typeof newContext === 'object') {
            Object.assign(this.context, newContext)
        }

        return this.context
    }


    clearContext (key) {
        if (key) {
            delete this.context[key]
        } else {
            for (key of Object.keys(this.context)) {
                delete this.context[key]
            }
        }

        return this.context
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





    execute (actionName, ...args) {
        const action = this.getAction(actionName) || this[actionName]

        if (typeof action === 'function') {
            action.call(this, ...args)
        }

        this.emit(actionName, ...args)
        this.emit('action', actionName, ...args)
    }

}


const INTERNAL_METHODS = new Set([
    'start', 'stop', 'dispose', 'create', 'on', 'once', 'off', 'emit',
    'emitter', 'addAction', 'getAction', 'removeAction',
    'hasAction', 'shouldPropagate', 'listActions', 'execute',
    'context', 'setContext', 'clearContext'
])

function isInternalMethod (methodName) {
    return INTERNAL_METHODS.has(methodName)
}
