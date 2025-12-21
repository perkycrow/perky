import Notifier from './notifier'
import Registry from './registry'
import ObservableSet from './observable_set'
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
    #eagerStart
    #tags = null
    #tagIndexes = new Map()

    static $category = 'default'
    static $eagerStart = true

    constructor (options = {}) {
        super()

        this.options = {...options}
        this.#name = options.$name || options.name || this.constructor.name
        this.#category = options.$category || this.constructor.$category
        this.#bind = options.$bind
        this.#eagerStart = options.$eagerStart

        this.#tags = new ObservableSet(options.$tags)

        this.#childrenRegistry = new Registry()
        this.#childrenRegistry.addIndex('$category')
    }


    onStart () { } // eslint-disable-line class-methods-use-this

    onStop () { } // eslint-disable-line class-methods-use-this

    onDispose () { } // eslint-disable-line class-methods-use-this

    onInstall () { } // eslint-disable-line class-methods-use-this

    onUninstall () { } // eslint-disable-line class-methods-use-this


    get $name () {
        return this.#name
    }


    set $name (newName) {
        const oldName = this.#name

        if (oldName !== newName) {
            this.#name = newName
            this.emit('$name:changed', newName, oldName)
        }
    }


    get $category () {
        return this.#category
    }


    set $category (newCategory) {
        const oldCategory = this.#category

        if (oldCategory !== newCategory) {
            this.#category = newCategory
            this.emit('$category:changed', newCategory, oldCategory)
        }
    }


    get $bind () {
        return this.#bind
    }


    set $bind (newBind) {
        const oldBind = this.#bind

        if (oldBind !== newBind) {
            this.#bind = newBind
            this.emit('$bind:changed', newBind, oldBind)
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


    get $eagerStart () {
        return this.#eagerStart
    }


    get $tags () {
        return this.#tags.toArray()
    }


    set $tags (newTags) {
        this.#tags.clear()
        if (Array.isArray(newTags)) {
            newTags.forEach(tag => this.#tags.add(tag))
        }
    }


    get tags () {
        return this.#tags
    }


    hasTag (tag) {
        return this.#tags.has(tag)
    }


    hasTags (tags) {
        if (typeof tags === 'string') {
            return this.hasTag(tags)
        }

        return Array.isArray(tags) && tags.every(tag => this.#tags.has(tag))
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


    create (Child, options = {}) {
        options.$category ||= Child.$category
        options.$name ||= uniqueId(this.childrenRegistry, options.$category)
        options.$eagerStart = options.$eagerStart ?? Child.$eagerStart ?? true

        const child = typeof Child === 'function' ? new Child(options) : Child

        unregisterExisting(this, options.$name)

        child.install(this, options)
        this.childrenRegistry.set(options.$name, child)

        setupLifecycle(this, child, options)

        this.#setupTagIndexListeners(child)

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


    listNamesFor (key, indexName = '$category') {
        return this.#childrenRegistry.lookupKeys(indexName, key)
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

        const eventArray = Array.isArray(events) ? events : Object.keys(events)
        eventArray.forEach((event) => {
            target.on(event, (...args) => {
                const prefixedEvent = namespace ? `${namespace}:${event}` : event
                this.emit(prefixedEvent, ...args)
            })
        })
    }


    childrenByTags (tags) {
        const tagArray = Array.isArray(tags) ? tags : [tags]

        if (tagArray.length === 0) {
            return []
        }

        const indexKey = getIndexKey(tagArray)
        const registry = this.#childrenRegistry

        if (this.#tagIndexes.has(indexKey)) {
            return registry.lookup(indexKey, indexKey)
        } else {
            return registry.all.filter(child => tagArray.every(tag => child.$tags?.includes(tag)))

        }
    }


    addTagsIndex (tags) {
        if (!Array.isArray(tags) || tags.length === 0) {
            return false
        }

        const indexKey = getIndexKey(tags)

        if (this.#tagIndexes.has(indexKey)) {
            return false
        }

        this.#childrenRegistry.addIndex(indexKey, child => {
            const hasAllTags = tags.every(tag => child.tags?.has(tag))
            return hasAllTags ? indexKey : null
        })

        this.#tagIndexes.set(indexKey, tags)

        this.#childrenRegistry.forEach(child => {
            if (child.tags) {
                this.#setupTagIndexListeners(child)
            }
        })

        return true
    }


    removeTagsIndex (tags) {
        const indexKey = getIndexKey(tags)

        if (!this.#tagIndexes.has(indexKey)) {
            return false
        }

        this.#childrenRegistry.removeIndex(indexKey)
        this.#tagIndexes.delete(indexKey)
        return true
    }


    #setupTagIndexListeners (child) {
        if (this.#tagIndexes.size === 0 || !child.tags) {
            return
        }

        const refreshAllIndexes = () => {
            for (const indexKey of this.#tagIndexes.keys()) {
                this.#childrenRegistry.refreshIndexFor(child, indexKey)
            }
        }

        child.tags.on('add', refreshAllIndexes)
        child.tags.on('delete', refreshAllIndexes)
        child.tags.on('clear', refreshAllIndexes)
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

    if (host.started && child.$eagerStart) {
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

    child.on('$category:changed', (newCategory, oldCategory) => {
        childrenRegistry.updateIndexFor(child, '$category', oldCategory, newCategory)
    })

    child.on('$name:changed', (newName, oldName) => {
        childrenRegistry.updateKey(oldName, newName, child)
    })

    child.on('$bind:changed', (newBind, oldBind) => {
        if (oldBind && host[oldBind] === child) {
            delete host[oldBind]
        }

        if (newBind) {
            host[newBind] = child
        }
    })
}


function unregisterChild (host, child) {
    if (host.childrenRegistry.hasEntry(child.$name, child)) {
        host.childrenRegistry.delete(child.$name)
    }

    if (child.$bind && host[child.$bind] === child) {
        delete host[child.$bind]
    }

    child.uninstall()

    host.emit(`${child.$category}:delete`, child.$name, child)
    child.emit('unregistered', host, child.$name)

    child.dispose()
}


function getIndexKey (tags) {
    return [...tags].sort().join('_')
}
