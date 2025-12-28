import Notifier from './notifier'
import Registry from './registry'
import ObservableSet from './observable_set'
import {uniqueId} from './utils'

import {
    unregisterExisting,
    getChild,
    hasChild,
    listNamesFor,
    removeChild,
    lookup,
    childrenByCategory
} from './perky_module/children.js'

import {
    setupLifecycle
} from './perky_module/lifecycle.js'

import {
    setupTagIndexListeners,
    hasTag,
    addTag,
    removeTag,
    hasTags,
    childrenByTags,
    addTagsIndex,
    removeTagsIndex
} from './perky_module/tags.js'

import {
    delegateTo,
    cleanDelegations,
    delegateEventsTo,
    cleanEventDelegations
} from './perky_module/delegation.js'




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


    get tagIndexes () {
        return this.#tagIndexes
    }


    get childrenRegistry () {
        return this.#childrenRegistry
    }


    get children () {
        return this.#childrenRegistry.all
    }


    get running () {
        return this.#started
    }


    get delegations () {
        return this.#delegations
    }


    get eventDelegations () {
        return this.#eventDelegations
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
        setupTagIndexListeners(child, this.#tagIndexes, this.#childrenRegistry)

        this.emit(`${child.$category}:set`, child.$id, child)
        child.emit('registered', this, child.$id)

        return child
    }


    static perkyModuleMethods = Notifier.notifierMethods.concat([
        'start',
        'stop',
        'dispose',
        'install',
        'uninstall',
        'create'
    ])

}


extendPrototype(PerkyModule, {
    getChild,
    hasChild,
    listNamesFor,
    removeChild,
    lookup,
    childrenByCategory,
    hasTag,
    addTag,
    removeTag,
    hasTags,
    childrenByTags,
    addTagsIndex,
    removeTagsIndex,
    delegateTo,
    cleanDelegations,
    delegateEventsTo,
    cleanEventDelegations
})


function extendPrototype (Class, methods) {
    for (const name in methods) {
        Class.prototype[name] = methods[name]
        Class.perkyModuleMethods.push(name)
    }
}
