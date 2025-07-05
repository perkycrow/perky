
export default class Plugin {

    constructor (options = {}) {
        this.options = options
        this.name = options.name || this.constructor.name
        this.engine = null
        this.installed = false
    }


    install (engine) {
        if (this.installed) {
            return false
        }

        this.engine = engine
        this.installed = true

        this.onInstall(engine)

        return true
    }


    uninstall () {
        if (!this.installed) {
            return false
        }

        this.onUninstall(this.engine)

        this.installed = false
        this.engine = null

        return true
    }


    onInstall () { // eslint-disable-line class-methods-use-this
        // Override in subclasses
    }


    onUninstall () { // eslint-disable-line class-methods-use-this
        // Override in subclasses
    }


    registerModule (name, module) {
        return this.engine.registerModule(name, module)
    }


    requirePlugin (pluginName) {
        if (!this.engine.isPluginInstalled(pluginName)) {
            throw new Error(`Plugin '${this.name}' requires plugin '${pluginName}' but it is not installed`)
        }
        return this.engine.getPlugin(pluginName)
    }


    addMethod (methodName, method) {
        if (typeof method !== 'function') {
            throw new Error('Method must be a function')
        }

        if (this.engine[methodName]) {
            console.warn(`Method ${methodName} already exists on engine`)
            return false
        }

        this.engine[methodName] = method.bind(this.engine)
        return true
    }


    overrideMethod (methodName, method) {
        if (typeof method !== 'function') {
            throw new Error('Method must be a function')
        }

        this.engine[methodName] = method.bind(this.engine)
        return true
    }


    wrapMethod (methodName, method) {
        if (typeof method !== 'function') {
            throw new Error('Method must be a function')
        }

        const originalMethod = this.engine[methodName]
        const originalFunction = typeof originalMethod === 'function' ? originalMethod : () => {}

        this.engine[methodName] = function (...args) {
            return method.call(this, originalFunction.bind(this), ...args)
        }

        return true
    }


    addProperty (propertyName, descriptor) {
        if (this.engine.hasOwnProperty(propertyName)) {
            console.warn(`Property ${propertyName} already exists on engine`)
            return false
        }

        Object.defineProperty(this.engine, propertyName, descriptor)
        return true
    }


    bindEvents (eventBindings) {
        if (!eventBindings || typeof eventBindings !== 'object') {
            return
        }

        Object.keys(eventBindings).forEach(eventName => {
            const handler = eventBindings[eventName]
            if (typeof handler === 'function') {
                this.engine.on(eventName, handler)
            }
        })
    }

}
