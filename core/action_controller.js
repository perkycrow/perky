import PerkyModule from '../core/perky_module'
import Registry from '../core/registry'


export default class ActionController extends PerkyModule {

    static propagable = []

    #actions = new Registry()
    #actionList = []

    constructor (actions) {
        super()

        this.context = {}

        this.#actionList = extractPrototypeMethods(this)

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
        if (!this.#actionList.includes(actionName)) {
            this.#actionList.push(actionName)
        }
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


    listActions () {
        return [...this.#actionList]
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
    'hasAction', 'shouldPropagate', 'listActions', 'execute', 'context'
])


function isInternalMethod (methodName) {
    return INTERNAL_METHODS.has(methodName)
}


function extractPrototypeMethods (instance) { // eslint-disable-line complexity
    const methods = []
    const proto = Object.getPrototypeOf(instance)
    const propertyNames = Object.getOwnPropertyNames(proto)

    for (const method of propertyNames) {
        if (method !== 'constructor' &&
            typeof instance[method] === 'function' &&
            !method.startsWith('_') &&
            !method.startsWith('#') &&
            !isInternalMethod(method)) {
            methods.push(method)
        }
    }

    return methods
}
