import PerkyModule from '../core/perky_module.js'
import Group2D from '../render/group_2d.js'
import Object2D from '../render/object_2d.js'
import AutoView from './auto_view.js'


function isObject2DClass (Class) {
    if (!Class || typeof Class !== 'function') {
        return false
    }

    let proto = Class.prototype
    while (proto) {
        if (proto.constructor === Object2D) {
            return true
        }
        proto = Object.getPrototypeOf(proto)
    }
    return false
}


export default class WorldView extends PerkyModule {

    static $category = 'worldView'

    #classRegistry = new Map()
    #matcherRegistry = []
    #views = new Map()

    constructor (options = {}) {
        super(options)

        this.world = options.world
        this.game = options.game

        this.rootGroup = new Group2D()
    }


    onStart () {
        this.#bindWorldEvents()
    }


    onStop () {
        this.#disposeAllViews()
    }


    register (classOrMatcher, View, config = null) {
        const isObject2D = isObject2DClass(View)
        const registration = isObject2D
            ? {View: AutoView, config, ObjectClass: View}
            : {View, config}

        if (typeof classOrMatcher === 'function' && classOrMatcher.prototype) {
            const isClass = classOrMatcher.toString().startsWith('class ') ||
                Object.getOwnPropertyNames(classOrMatcher.prototype).length > 1

            if (isClass) {
                this.#classRegistry.set(classOrMatcher, registration)
                return this
            }
        }

        this.#matcherRegistry.push({matcher: classOrMatcher, ...registration})
        return this
    }


    unregister (classOrMatcher) {
        if (this.#classRegistry.has(classOrMatcher)) {
            this.#classRegistry.delete(classOrMatcher)
            return true
        }

        const index = this.#matcherRegistry.findIndex(entry => entry.matcher === classOrMatcher)
        if (index !== -1) {
            this.#matcherRegistry.splice(index, 1)
            return true
        }

        return false
    }


    clearRegistry () {
        this.#classRegistry.clear()
        this.#matcherRegistry.length = 0
        return this
    }


    getViews (entityId) {
        return this.#views.get(entityId) || []
    }


    updateViews (deltaTime) {
        for (const views of this.#views.values()) {
            for (const view of views) {
                view.update?.(deltaTime)
            }
        }
    }


    syncViews () {
        for (const views of this.#views.values()) {
            for (const view of views) {
                view.sync()
            }
        }
    }


    setupRenderGroups () {
        const gameRenderer = this.game.getRenderer('game')

        gameRenderer.appendRenderGroup({
            $name: 'entities',
            content: this.rootGroup
        })
    }


    update (deltaTime) {
        this.updateViews(deltaTime)
    }


    sync () {
        this.syncViews()
    }


    #bindWorldEvents () {
        if (!this.world) {
            return
        }

        this.listenTo(this.world, 'entity:set', (id, entity) => this.#handleEntitySet(entity))
        this.listenTo(this.world, 'entity:delete', (id) => this.#handleEntityDelete(id))

        for (const entity of this.world.entities) {
            this.#handleEntitySet(entity)
        }
    }


    #handleEntitySet (entity) {
        const registrations = this.#resolveViews(entity)

        if (registrations.length === 0) {
            return
        }

        const views = []

        for (const {View, config, ObjectClass} of registrations) {
            const context = {
                game: this.game,
                world: this.world,
                group: this.rootGroup,
                config,
                ObjectClass
            }

            const view = new View(entity, context)

            if (view.root) {
                view.root.$entity = entity
                view.root.$view = view
                view.root.$viewName = ObjectClass ? ObjectClass.name : View.name
                this.rootGroup.addChild(view.root)
            }

            views.push(view)
        }

        this.#views.set(entity.$id, views)
        this.emit('view:added', entity.$id, views)
    }


    #handleEntityDelete (entityId) {
        const views = this.#views.get(entityId)

        if (views) {
            this.emit('view:removed', entityId, views)
            for (const view of views) {
                view.dispose()
            }
            this.#views.delete(entityId)
        }
    }


    #disposeAllViews () {
        for (const views of this.#views.values()) {
            for (const view of views) {
                view.dispose()
            }
        }
        this.#views.clear()
    }


    #resolveViews (entity) {
        const results = []
        const EntityClass = entity.constructor

        const classRegistration = this.#classRegistry.get(EntityClass)
        if (classRegistration) {
            results.push(classRegistration)
        }

        for (const entry of this.#matcherRegistry) {
            if (entry.matcher(entity)) {
                results.push(entry)
            }
        }

        return results
    }

}
