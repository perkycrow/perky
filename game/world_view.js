import PerkyModule from '../core/perky_module.js'
import Group2D from '../render/group_2d.js'


export default class WorldView extends PerkyModule {

    static $category = 'worldView'

    #classRegistry = new Map()
    #matcherRegistry = []
    #views = new Map()

    constructor (options = {}) {
        super(options)

        this.world = options.world
        this.game = options.game
        this.rootGroup = new Group2D({name: 'world'})
    }


    register (classOrMatcher, View, config = null) {
        if (typeof classOrMatcher === 'function' && classOrMatcher.prototype) {
            const isClass = classOrMatcher.toString().startsWith('class ') ||
                Object.getOwnPropertyNames(classOrMatcher.prototype).length > 1

            if (isClass) {
                this.#classRegistry.set(classOrMatcher, {View, config})
                return this
            }
        }

        this.#matcherRegistry.push({matcher: classOrMatcher, View, config})
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


    onStart () {
        if (!this.world) {
            return
        }

        this.listenTo(this.world, 'entity:set', (id, entity) => this.#handleEntitySet(entity))
        this.listenTo(this.world, 'entity:delete', (id) => this.#handleEntityDelete(id))

        for (const entity of this.world.entities) {
            this.#handleEntitySet(entity)
        }
    }


    onStop () {
        this.#disposeAllViews()
    }


    sync (deltaTime = 0) {
        for (const views of this.#views.values()) {
            for (const view of views) {
                view.sync(deltaTime)
            }
        }
    }


    getViews (entityId) {
        return this.#views.get(entityId) || []
    }


    #handleEntitySet (entity) {
        const registrations = this.#resolveViews(entity)

        if (registrations.length === 0) {
            return
        }

        const views = []

        for (const {View, config} of registrations) {
            const context = {
                game: this.game,
                world: this.world,
                group: this.rootGroup,
                config
            }

            const view = new View(entity, context)

            if (view.root) {
                view.root.$entity = entity
                view.root.$view = view
                view.root.$viewName = View.name
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
