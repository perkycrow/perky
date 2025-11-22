import Notifier from './notifier'
import Registry from './registry'


export default class PerkyModule extends Notifier {

    #extensions = null

    constructor (options = {}) {
        super()
        this.started = false
        this.options = options
        this.name = options.name || this.constructor.name
        this.host = null
        this.installed = false
        this.#extensions = new Registry()
    }


    get running () {
        return this.started
    }


    install (host, options) {
        if (this.installed) {
            return false
        }

        this.host = host
        this.installed = true

        this.onInstall(host, options)

        return true
    }


    uninstall () {
        if (!this.installed) {
            return false
        }

        this.onUninstall(this.host)

        this.installed = false
        this.host = null

        return true
    }


    onInstall () { // eslint-disable-line class-methods-use-this
        // Override in subclasses
    }


    onUninstall () { // eslint-disable-line class-methods-use-this
        // Override in subclasses
    }


    use (ExtensionClassOrInstance, options = {}) {
        const extension = prepareExtension(ExtensionClassOrInstance, options)
        const extensionName = getExtensionName(extension, options)
        
        if (!validateExtension(extension, extensionName)) {
            return false
        }

        unregisterExisting(this, extensionName, options)

        if (!registerExtension(this, extension, extensionName, options)) {
            return false
        }

        setupBinding(this, extension, options)
        setupLifecycle(this, extension, extensionName, options)
        emitRegistrationEvents(this, extension, extensionName, options)

        return extension
    }


    getExtension (name) {
        return this.#extensions.get(name)
    }


    hasExtension (name) {
        return this.#extensions.has(name)
    }


    getExtensionsRegistry () {
        return this.#extensions
    }


    removeExtension (name) {
        const extension = this.#extensions.get(name)
        if (!extension) {
            return false
        }

        const category = extension.$category || 'extension'
        const bind = extension.$bind

        unregisterExtension(this, name, extension, category, bind)
        return true
    }


    start () {
        if (this.started) {
            return false
        }

        this.started = true
        this.emit('start')

        return true
    }


    stop () {
        if (!this.started) {
            return false
        }

        this.started = false
        this.emit('stop')

        return true
    }


    dispose () {
        if (this.disposed) {
            return false
        }

        this.disposed = true
        this.stop()
        
        this.#extensions.clear()
        
        this.emit('dispose')
        this.removeListeners()

        return true
    }


    requireExtension (extensionName) {
        if (!this.host || !this.host.hasExtension(extensionName)) {
            throw new Error(`Extension '${this.name}' requires extension '${extensionName}' but it is not installed`)
        }
        return this.host.getExtension(extensionName)
    }


    addMethod (methodName, method) {
        if (typeof method !== 'function') {
            throw new Error('Method must be a function')
        }

        if (!this.host) {
            throw new Error('Cannot add method: extension has no host')
        }

        if (this.host[methodName]) {
            console.warn(`Method ${methodName} already exists on host`)
            return false
        }

        this.host[methodName] = method.bind(this.host)
        return true
    }


    overrideMethod (methodName, method) {
        if (typeof method !== 'function') {
            throw new Error('Method must be a function')
        }

        if (!this.host) {
            throw new Error('Cannot override method: extension has no host')
        }

        this.host[methodName] = method.bind(this.host)
        return true
    }


    wrapMethod (methodName, method) {
        if (typeof method !== 'function') {
            throw new Error('Method must be a function')
        }

        if (!this.host) {
            throw new Error('Cannot wrap method: extension has no host')
        }

        const originalMethod = this.host[methodName]
        const originalFunction = typeof originalMethod === 'function' ? originalMethod : () => {}

        this.host[methodName] = function (...args) {
            return method.call(this, originalFunction.bind(this), ...args)
        }

        return true
    }


    addProperty (propertyName, descriptor) {
        if (!this.host) {
            throw new Error('Cannot add property: extension has no host')
        }

        if (this.host.hasOwnProperty(propertyName)) {
            console.warn(`Property ${propertyName} already exists on host`)
            return false
        }

        Object.defineProperty(this.host, propertyName, descriptor)
        return true
    }


    bindEvents (eventBindings) {
        if (!eventBindings || typeof eventBindings !== 'object') {
            return
        }

        if (!this.host) {
            throw new Error('Cannot bind events: extension has no host')
        }

        Object.keys(eventBindings).forEach(eventName => {
            const handler = eventBindings[eventName]
            if (typeof handler === 'function') {
                this.host.on(eventName, handler)
            }
        })
    }


    delegateTo (target, methodNames) {
        if (!target || !Array.isArray(methodNames)) {
            return
        }

        methodNames.forEach(methodName => {
            if (typeof target[methodName] === 'function') {
                this.addMethod(methodName, target[methodName].bind(target))
            }
        })
    }


    delegateProperties (target, propertyNames, readOnly = false) {
        if (!target || !Array.isArray(propertyNames)) {
            return
        }

        propertyNames.forEach(propertyName => {
            const descriptor = {
                get: () => target[propertyName]
            }

            if (!readOnly) {
                descriptor.set = (value) => {
                    target[propertyName] = value
                }
            }

            this.addProperty(propertyName, descriptor)
        })
    }

}


function prepareExtension (ExtensionClassOrInstance, options) {
    const {instance, ...instanceOptions} = options

    if (instance) {
        return instance
    }

    if (typeof ExtensionClassOrInstance === 'function') {
        return new ExtensionClassOrInstance(instanceOptions)
    }

    return ExtensionClassOrInstance
}


function getExtensionName (extension, options) {
    return options.$name || extension.name || extension.constructor.name
}


function validateExtension (extension, extensionName) {
    if (!(extension instanceof PerkyModule)) {
        console.warn(`Attempted to use non-extension object: ${extensionName}`)
        return false
    }

    return true
}


function unregisterExisting (host, extensionName, options) {
    const extensions = host.getExtensionsRegistry()
    if (extensions.has(extensionName)) {
        const existing = extensions.get(extensionName)
        const category = existing.$category || options.$category || 'extension'
        const bind = existing.$bind

        unregisterExtension(host, extensionName, existing, category, bind)
    }
}


function registerExtension (host, extension, extensionName, options) {
    extension.host = host

    if (!extension.install(host, options)) {
        console.warn(`Failed to install extension: ${extensionName}`)
        return false
    }

    const extensions = host.getExtensionsRegistry()
    extensions.set(extensionName, extension)

    extension.$category = options.$category || 'extension'
    extension.$bind = options.$bind

    return true
}


function setupBinding (host, extension, options) {
    if (options.$bind) {
        host[options.$bind] = extension
    }
}


function setupLifecycle (host, extension, extensionName, options) {
    const {$lifecycle = true} = options

    if (!$lifecycle) {
        return
    }

    const extensions = host.getExtensionsRegistry()

    if (host.started) {
        extension.start()
    }

    host.on('start', () => {
        if (extensions.get(extensionName) === extension) {
            extension.start()
        }
    })

    host.on('stop', () => {
        if (extensions.get(extensionName) === extension) {
            extension.stop()
        }
    })

    host.on('dispose', () => {
        if (extensions.get(extensionName) === extension) {
            const category = extension.$category || 'extension'
            const bind = extension.$bind
            unregisterExtension(host, extensionName, extension, category, bind)
        }
    })

    extension.once('dispose', () => {
        if (extensions.get(extensionName) === extension) {
            const category = extension.$category || 'extension'
            const bind = extension.$bind
            unregisterExtension(host, extensionName, extension, category, bind)
        }
    })
}


function emitRegistrationEvents (host, extension, extensionName, options) {
    const category = options.$category || 'extension'

    host.emit(`${category}:set`, extensionName, extension)
    extension.emit('registered', host, extensionName)
}


function unregisterExtension (host, extensionName, extension, category, bind) { // eslint-disable-line max-params
    const extensions = host.getExtensionsRegistry()
    extensions.delete(extensionName)

    if (bind && host[bind] === extension) {
        delete host[bind]
    }

    extension.uninstall()

    host.emit(`${category}:delete`, extensionName, extension)
    extension.emit('unregistered', host, extensionName)

    if (!extension.disposed) {
        extension.dispose()
    }
}
