import PerkyModule from './perky_module.js'
import Registry from './registry.js'


export default class ActionController extends PerkyModule {

    static propagable = []
    static bindings = {}
    static $category = 'actionController'

    #actions = new Registry()
    #actionList = []

    constructor (options = {}) {
        super(options)
        this.context = {}
        this.#actionList = extractPrototypeMethods(this)
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


    static normalizeBindings (controllerName) {
        const bindings = this.bindings
        const normalized = []

        for (const [actionName, bindingDef] of Object.entries(bindings)) {
            const bindingConfigs = normalizeBindingDefinition(bindingDef)

            for (const config of bindingConfigs) {
                normalized.push({
                    action: actionName,
                    key: config.key,
                    scoped: config.scoped ?? false,
                    eventType: config.eventType ?? 'pressed',
                    controllerName: config.scoped ? controllerName : null
                })
            }
        }

        return normalized
    }


    static actionControllerMethods = this.perkyModuleMethods.concat([
        'addAction',
        'getAction',
        'removeAction',
        'hasAction',
        'shouldPropagate',
        'listActions',
        'execute',
        'context'
    ])

}


const internalMethods = new Set(ActionController.actionControllerMethods)


function isInternalMethod (methodName) {
    return internalMethods.has(methodName)
}


const ignoredPrefixes = ['_', '#', 'on', 'update', 'get', 'check']


function extractPrototypeMethods (instance) { // eslint-disable-line complexity
    const methods = []
    const proto = Object.getPrototypeOf(instance)
    const propertyNames = Object.getOwnPropertyNames(proto)

    for (const method of propertyNames) {
        if (method === 'constructor') {
            continue
        }

        if (ignoredPrefixes.some(prefix => method.startsWith(prefix))) {
            continue
        }

        if (isInternalMethod(method)) {
            continue
        }

        const descriptor = Object.getOwnPropertyDescriptor(proto, method)

        if (descriptor && typeof descriptor.value === 'function') {
            methods.push(method)
        }
    }

    return methods
}


function normalizeBindingDefinition (bindingDef) {
    if (typeof bindingDef === 'string') {
        return [{key: bindingDef}]
    }

    if (Array.isArray(bindingDef)) {
        return bindingDef.map(key => ({key}))
    }

    if (typeof bindingDef === 'object' && bindingDef !== null) {
        const keys = Array.isArray(bindingDef.keys) ? bindingDef.keys : [bindingDef.keys]
        return keys.map(key => ({
            key,
            scoped: bindingDef.scoped ?? false,
            eventType: bindingDef.eventType ?? 'pressed'
        }))
    }

    return []
}
