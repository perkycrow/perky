import Notifier from './notifier'
import Registry from './registry'
import {uniqueId} from './utils'


export default class PerkyModule extends Notifier {

    #childrenRegistry = null
    #started = false
    #disposed = false

    constructor (options = {}) {
        super()

        this.options = options
        this.$name = options.$name || options.name || this.constructor.name
        this.host = null
        this.installed = false

        this.#childrenRegistry = new Registry()
        this.#childrenRegistry.addIndex('$category')
    }


    get started () {
        return this.#started
    }


    get disposed () {
        return this.#disposed
    }


    start () {
        if (this.#started) {
            return false
        }

        this.#started = true
        this.onStart?.()
        this.emit('start')

        return true
    }


    stop () {
        if (!this.#started) {
            return false
        }

        this.#started = false
        this.onStop?.()
        this.emit('stop')

        return true
    }


    dispose () {
        if (this.#disposed) {
            return false
        }

        this.#disposed = true
        this.stop()

        this.#childrenRegistry.forEach(child => {
            if (child && !child.disposed) {
                child.dispose()
            }
        })
        this.#childrenRegistry.clear()

        this.onDispose?.()
        this.emit('dispose')
        this.removeListeners()

        return true
    }


    onStart () { // eslint-disable-line class-methods-use-this
        // Override in subclasses
    }


    onStop () { // eslint-disable-line class-methods-use-this
        // Override in subclasses
    }


    onDispose () { // eslint-disable-line class-methods-use-this
        // Override in subclasses
    }


    hasMany (identifier, categoryName) {
        Object.defineProperty(this, identifier, {
            get: () => this.#childrenRegistry.lookup('$category', categoryName),
            enumerable: true,
            configurable: false
        })
    }


    get running () {
        return this.started
    }



    install (host, options) {
        if (this.installed) {
            return this.uninstall()
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


    create (ChildClassOrInstance, options = {}) {
        const child = prepareChild(ChildClassOrInstance, options)
        const childName = getChildName(this, child, options)

        unregisterExisting(this, childName, options)
        registerChild(this, child, childName, options)
        setupBinding(this, child, options)
        setupLifecycle(this, child, childName, options)
        emitRegistrationEvents(this, child, childName, options)

        return child
    }


    getChild (name) {
        return this.#childrenRegistry.get(name) || null
    }


    hasChild (name) {
        return this.#childrenRegistry.has(name)
    }


    get childrenRegistry () {
        return this.#childrenRegistry
    }


    get children () {
        return this.#childrenRegistry.all
    }


    getChildrenByCategory (category) {
        const children = this.#childrenRegistry.lookup('$category', category)

        // Map children instances back to their names for API compatibility
        return children.map(child => this.#childrenRegistry.keyFor(child))
    }


    removeChild (name) {
        const child = this.#childrenRegistry.get(name)
        if (!child) {
            return false
        }

        const category = child.$category || 'child'
        const bind = child.$bind

        unregisterChild(this, name, child, category, bind)
        return true
    }


    bindEvents (eventBindings) {
        if (!eventBindings || typeof eventBindings !== 'object') {
            return
        }

        if (!this.host) {
            throw new Error('Cannot bind events: child has no host')
        }

        Object.keys(eventBindings).forEach(eventName => {
            const handler = eventBindings[eventName]
            if (typeof handler === 'function') {
                this.host.on(eventName, handler)
            }
        })
    }


    delegate (target, names) {
        if (!target) {
            throw new Error('Target is required for delegation')
        }

        if (Array.isArray(names)) {
            names.forEach(name => {
                this.#delegateProperty(target, name, name)
            })
        } else if (typeof names === 'object') {
            Object.entries(names).forEach(([sourceName, hostName]) => {
                this.#delegateProperty(target, sourceName, hostName)
            })
        } else {
            throw new Error('Names must be an array or object')
        }
    }


    #delegateProperty (target, sourceName, hostName) { // eslint-disable-line complexity
        const descriptor = Object.getOwnPropertyDescriptor(target, sourceName)

        if (descriptor && (descriptor.get || descriptor.set)) {
            Object.defineProperty(this, hostName, {
                get: descriptor.get ? descriptor.get.bind(target) : undefined,
                set: descriptor.set ? descriptor.set.bind(target) : undefined,
                enumerable: true,
                configurable: true
            })
        } else if (typeof target[sourceName] === 'function') {
            this[hostName] = target[sourceName].bind(target)
        } else {
            Object.defineProperty(this, hostName, {
                get: () => target[sourceName],
                set: (value) => {
                    target[sourceName] = value
                },
                enumerable: true,
                configurable: true
            })
        }
    }


    delegateEvents (target, events, namespace) {
        if (!target || (!Array.isArray(events) && typeof events !== 'object')) {
            return
        }

        target.pipeTo(this, events, namespace)
    }

}


function prepareChild (Child, options) {
    let child = typeof Child === 'function' ? new Child(options) : Child

    if (!child.$category) {
        child.$category = options.$category || 'child'
    }

    return child
}


function getChildName (host, child, options) {
    if (options.$name) {
        return options.$name
    }

    const category = child.$category || 'child'
    return uniqueId(host.childrenRegistry, category)
}


function unregisterExisting (host, childName, options) {
    const children = host.childrenRegistry
    if (children.has(childName)) {
        const existing = children.get(childName)
        const category = existing.$category || options.$category || 'child'
        const bind = existing.$bind

        unregisterChild(host, childName, existing, category, bind)
    }
}


function registerChild (host, child, childName, options) {
    child.host = host

    child.install(host, options)

    if (options.$category) {
        child.$category = options.$category
    }
    child.$bind = options.$bind

    host.childrenRegistry.set(childName, child)
}


function setupBinding (host, child, options) {
    if (options.$bind) {
        host[options.$bind] = child
    }
}


function setupLifecycle (host, child, childName, options) {
    const {$lifecycle = true} = options

    if (!$lifecycle) {
        return
    }

    const childrenRegistry = host.childrenRegistry

    if (host.started) {
        child.start()
    }

    host.on('start', () => {
        child.start()
    })

    host.on('stop', () => {
        child.stop()
    })

    host.on('dispose', () => {
        if (childrenRegistry.get(childName) === child) {
            const category = child.$category || 'child'
            const bind = child.$bind
            unregisterChild(host, childName, child, category, bind)
        }
    })

    child.once('dispose', () => {
        if (childrenRegistry.get(childName) === child) {
            const category = child.$category || 'child'
            const bind = child.$bind
            unregisterChild(host, childName, child, category, bind)
        }
    })
}


function emitRegistrationEvents (host, child, childName, options) {
    const category = options.$category || 'child'

    host.emit(`${category}:set`, childName, child)
    child.emit('registered', host, childName)
}


function unregisterChild (host, childName, child, category, bind) { // eslint-disable-line max-params
    host.childrenRegistry.delete(childName)

    if (bind && host[bind] === child) {
        delete host[bind]
    }

    child.uninstall()

    host.emit(`${category}:delete`, childName, child)
    child.emit('unregistered', host, childName)

    if (!child.disposed) {
        child.dispose()
    }
}
