import Notifier from './notifier'
import Registry from './registry'
import {uniqueId} from './utils'


export default class PerkyModule extends Notifier {

    #childrenRegistry = null
    #started = false
    #disposed = false
    #installed = false
    #name
    #category
    #host = null
    #bind

    constructor (options = {}) {
        super()

        this.options = {...options}
        this.#name = options.$name || options.name || this.constructor.name
        this.#category = options.$category
        this.#bind = options.$bind

        this.#childrenRegistry = new Registry()
        this.#childrenRegistry.addIndex('$category')
    }


    get $name () {
        return this.#name
    }


    set $name (newName) {
        const oldName = this.#name

        if (oldName !== newName) {
            this.#name = newName
            this.emit('name:changed', newName, oldName)
        }
    }


    get $category () {
        return this.#category
    }


    set $category (newCategory) {
        const oldCategory = this.#category

        if (oldCategory !== newCategory) {
            this.#category = newCategory
            this.emit('category:changed', newCategory, oldCategory)
        }
    }


    get $bind () {
        return this.#bind
    }


    set $bind (newBind) {
        const oldBind = this.#bind

        if (oldBind !== newBind) {
            this.#bind = newBind
            this.emit('bind:changed', newBind, oldBind)
        }
    }


    get host () {
        return this.#host
    }


    get started () {
        return this.#started
    }


    get disposed () {
        return this.#disposed
    }


    get installed () {
        return this.#installed
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
        return this.#started
    }


    install (host, options) {
        if (this.#installed) {
            return this.uninstall()
        }

        this.#host = host
        if (this.$bind) {
            host[this.$bind] = this
        }
        this.#installed = true


        this.onInstall(host, options)

        return true
    }


    uninstall () {
        if (!this.#installed) {
            return false
        }

        this.onUninstall(this.#host)
        this.#installed = false
        this.#host = null

        return true
    }


    onInstall () { // eslint-disable-line class-methods-use-this
        // Override in subclasses
    }


    onUninstall () { // eslint-disable-line class-methods-use-this
        // Override in subclasses
    }


    create (Child, options = {}) {
        options.$category ||= 'child'
        options.$name ||= uniqueId(this.childrenRegistry, options.$category)

        const child = typeof Child === 'function' ? new Child(options) : Child

        unregisterExisting(this, options.$name)

        child.install(this, options)
        this.childrenRegistry.set(options.$name, child)


        setupLifecycle(this, child, options)

        this.emit(`${child.$category}:set`, child.$name, child)
        child.emit('registered', this, child.$name)

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

        unregisterChild(this, child)

        return true
    }


    bindEvents (eventBindings) {
        if (!eventBindings || typeof eventBindings !== 'object') {
            return
        }

        if (!this.#host) {
            throw new Error('Cannot bind events: child has no host')
        }

        Object.keys(eventBindings).forEach(eventName => {
            const handler = eventBindings[eventName]
            if (typeof handler === 'function') {
                this.#host.on(eventName, handler)
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


function unregisterExisting (host, childName) {
    const children = host.childrenRegistry

    if (children.has(childName)) {
        unregisterChild(host, children.get(childName))
    }
}


function setupLifecycle (host, child, options) {
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
        if (childrenRegistry.hasEntry(child.$name, child)) {
            unregisterChild(host, child)
        }
    })

    child.once('dispose', () => {
        if (childrenRegistry.hasEntry(child.$name, child)) {
            unregisterChild(host, child)
        }
    })

    child.on('category:changed', (newCategory, oldCategory) => {
        childrenRegistry.updateIndexFor(child, '$category', oldCategory, newCategory)
    })

    child.on('name:changed', (newName, oldName) => {
        childrenRegistry.updateKey(oldName, newName, child)
    })

    child.on('bind:changed', (newBind, oldBind) => {
        if (oldBind && host[oldBind] === child) {
            delete host[oldBind]
        }

        if (newBind) {
            host[newBind] = child
        }
    })
}


function unregisterChild (host, child) { // eslint-disable-line max-params
    if (host.childrenRegistry.hasEntry(child.$name, child)) {
        host.childrenRegistry.delete(child.$name)
    }

    if (child.$bind && host[child.$bind] === child) {
        delete host[child.$bind]
    }

    child.uninstall()

    host.emit(`${child.$category}:delete`, child.$name, child)
    child.emit('unregistered', host, child.$name)

    if (!child.disposed) {
        child.dispose()
    }
}
