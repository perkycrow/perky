import Notifier from './notifier'
import Registry from './registry'
import ObservableSet from './observable_set'
import {uniqueId} from './utils'




export default class PerkyModule extends Notifier {

    #childrenRegistry = null
    #started = false
    #disposed = false
    #installed = false
    #id
    #name
    #category
    #host = null
    #bind
    #eagerStart
    #lifecycle
    #tags = null
    #tagIndexes = new Map()
    #delegations = []
    #eventDelegations = []

    static $category = 'perkyModule'
    static $name = null
    static $eagerStart = true
    static $tags = []

    constructor (options = {}) {
        super()

        this.options = {...options}
        this.#name = options.$name || this.constructor.$name || this.constructor.name
        this.#id = options.$id || this.#name
        this.#category = options.$category || this.constructor.$category
        this.#bind = options.$bind
        this.#eagerStart = options.$eagerStart
        this.#lifecycle = options.$lifecycle !== false

        this.#tags = new ObservableSet([
            ...this.constructor.$tags,
            ...(options.$tags || [])
        ])

        this.#childrenRegistry = new Registry()
        this.#childrenRegistry.addIndex('$category')
    }


    get $id () {
        return this.#id
    }


    set $id (newName) {
        const oldName = this.#id

        if (oldName !== newName) {
            this.#id = newName
            this.emit('$id:changed', newName, oldName)
        }
    }


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


    get $lifecycle () {
        return this.#lifecycle
    }


    get $status () {
        if (!this.#lifecycle) {
            return 'static'
        }

        if (this.#disposed) {
            return 'disposed'
        }

        if (this.#started) {
            return 'started'
        }

        return 'stopped'
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


    addTag (tag) {
        if (this.#tags.has(tag)) {
            return false
        }
        this.#tags.add(tag)
        return true
    }


    removeTag (tag) {
        return this.#tags.delete(tag)
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

        this.cleanExternalListeners()

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


        this.onInstall?.(host, options)

        return true
    }


    uninstall () {
        if (!this.#installed) {
            return false
        }

        this.cleanDelegations()
        this.cleanEventDelegations()
        this.onUninstall?.(this.#host)
        this.#installed = false
        this.#host = null

        return true
    }


    create (Child, options = {}) { // eslint-disable-line complexity
        options.$category ||= Child.$category
        options.$name ||= Child.$name || options.$category
        options.$id ||= uniqueId(this.childrenRegistry, options.$name)
        options.$eagerStart = options.$eagerStart ?? Child.$eagerStart ?? true

        return this.#addChild(new Child(options), options)
    }


    #addChild (child, options = {}) {
        unregisterExisting(this, child.$id)

        child.install(this, options)
        this.childrenRegistry.set(child.$id, child)

        setupLifecycle(this, child, options)
        this.#setupTagIndexListeners(child)

        this.emit(`${child.$category}:set`, child.$id, child)
        child.emit('registered', this, child.$id)

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


    delegateTo (host, names) {
        delegateProperties(host, this, names)

        const propertyNames = Array.isArray(names)
            ? names
            : Object.values(names)

        this.#delegations.push({host, propertyNames})
    }


    cleanDelegations () {
        for (const {host, propertyNames} of this.#delegations) {
            for (const name of propertyNames) {
                delete host[name]
            }
        }
        this.#delegations = []
    }


    delegateEventsTo (host, events, namespace) {
        const eventArray = Array.isArray(events) ? events : Object.keys(events)
        const callbacks = []

        for (const event of eventArray) {
            const prefixedEvent = namespace ? `${namespace}:${event}` : event
            const callback = (...args) => host.emit(prefixedEvent, ...args)
            this.on(event, callback)
            callbacks.push({event, callback})
        }

        this.#eventDelegations.push({callbacks})
    }


    cleanEventDelegations () {
        for (const {callbacks} of this.#eventDelegations) {
            for (const {event, callback} of callbacks) {
                this.off(event, callback)
            }
        }
        this.#eventDelegations = []
    }


    lookup (indexName, key) {
        return this.#childrenRegistry.lookup(indexName, key)
    }


    childrenByCategory (category) {
        return this.lookup('$category', category)
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

        child.listenTo(child.tags, 'add', refreshAllIndexes)
        child.listenTo(child.tags, 'delete', refreshAllIndexes)
        child.listenTo(child.tags, 'clear', refreshAllIndexes)
    }


    static perkyModuleMethods = this.notifierMethods.concat([
        'start',
        'stop',
        'dispose',
        'install',
        'uninstall',
        'create',
        'getChild',
        'hasChild',
        'childrenRegistry',
        'children',
        'listNamesFor',
        'removeChild',
        'delegateTo',
        'cleanDelegations',
        'delegateEventsTo',
        'cleanEventDelegations',
        'childrenByTags',
        'addTagsIndex',
        'removeTagsIndex'
    ])

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

    child.listenTo(host, 'start', () => {
        child.start()
    })

    child.listenTo(host, 'stop', () => {
        child.stop()
    })

    child.listenTo(host, 'dispose', () => {
        if (childrenRegistry.hasEntry(child.$id, child)) {
            unregisterChild(host, child)
        }
    })

    child.once('dispose', () => {
        if (childrenRegistry.hasEntry(child.$id, child)) {
            unregisterChild(host, child)
        }
    })

    child.on('$category:changed', (newCategory, oldCategory) => {
        childrenRegistry.updateIndexFor(child, '$category', oldCategory, newCategory)
    })

    child.on('$id:changed', (newName, oldName) => {
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
    if (host.childrenRegistry.hasEntry(child.$id, child)) {
        host.childrenRegistry.delete(child.$id)
    }

    if (child.$bind && host[child.$bind] === child) {
        delete host[child.$bind]
    }

    child.uninstall()

    host.emit(`${child.$category}:delete`, child.$id, child)
    child.emit('unregistered', host, child.$id)

    child.dispose()
}


function getIndexKey (tags) {
    return [...tags].sort().join('_')
}


function delegateProperties (receiver, source, names) {
    if (Array.isArray(names)) {
        names.forEach(name => delegateProperty(receiver, source, name, name))
    } else if (typeof names === 'object') {
        Object.entries(names).forEach(([sourceName, receiverName]) => {
            delegateProperty(receiver, source, sourceName, receiverName)
        })
    }
}


function delegateProperty (receiver, source, sourceName, receiverName) { // eslint-disable-line complexity
    const descriptor = Object.getOwnPropertyDescriptor(source, sourceName)

    if (descriptor && (descriptor.get || descriptor.set)) {
        Object.defineProperty(receiver, receiverName, {
            get: descriptor.get ? descriptor.get.bind(source) : undefined,
            set: descriptor.set ? descriptor.set.bind(source) : undefined,
            enumerable: true,
            configurable: true
        })
    } else if (typeof source[sourceName] === 'function') {
        receiver[receiverName] = source[sourceName].bind(source)
    } else {
        Object.defineProperty(receiver, receiverName, {
            get: () => source[sourceName],
            set: (value) => {
                source[sourceName] = value
            },
            enumerable: true,
            configurable: true
        })
    }
}
