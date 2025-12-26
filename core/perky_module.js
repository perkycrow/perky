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

    static $category = 'perkyModule'
    static $name = null
    static $eagerStart = true

    constructor (options = {}) {
        super()

        this.options = {...options}
        this.#name = options.$name || this.constructor.$name || this.constructor.name
        this.#id = options.$id || this.#name
        this.#category = options.$category || this.constructor.$category
        this.#bind = options.$bind
        this.#eagerStart = options.$eagerStart
        this.#lifecycle = options.$lifecycle !== false

        this.#tags = new ObservableSet(options.$tags)

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
        if (typeof target === 'string' || typeof sourceName === 'symbol') {
            this.#delegatePropertySym(target, sourceName, hostName)
            return
        }

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


    #delegatePropertySym (targetName, sourceName, hostName) {
        Object.defineProperty(this, hostName, {
            get: () => {
                const target = this[targetName]
                const value = target?.[sourceName]

                if (typeof value === 'function') {
                    return value.bind(target)
                }
                return value
            },
            set: (value) => {
                this[targetName][sourceName] = value
            },
            enumerable: true,
            configurable: true
        })
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
        'delegate',
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
