import PerkyModule from '../core/perky_module'
import Group2D from './group_2d'


export default class WorldRenderer extends PerkyModule {

    static $category = 'worldRenderer'

    #classRegistry = new Map()
    #matcherRegistry = []
    #renderers = new Map()

    constructor (options = {}) {
        super(options)

        this.world = options.world
        this.game = options.game
        this.rootGroup = new Group2D({name: 'world'})
    }


    register (classOrMatcher, Renderer, config = null) {
        if (typeof classOrMatcher === 'function' && classOrMatcher.prototype) {
            const isClass = classOrMatcher.toString().startsWith('class ') ||
                Object.getOwnPropertyNames(classOrMatcher.prototype).length > 1

            if (isClass) {
                this.#classRegistry.set(classOrMatcher, {Renderer, config})
                return this
            }
        }

        this.#matcherRegistry.push({matcher: classOrMatcher, Renderer, config})
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
        this.#disposeAllRenderers()
    }


    sync () {
        for (const renderers of this.#renderers.values()) {
            for (const renderer of renderers) {
                renderer.sync()
            }
        }
    }


    getRenderers (entityId) {
        return this.#renderers.get(entityId) || []
    }


    #handleEntitySet (entity) {
        const registrations = this.#resolveRenderers(entity)

        if (registrations.length === 0) {
            return
        }

        const renderers = []

        for (const {Renderer, config} of registrations) {
            const context = {
                game: this.game,
                world: this.world,
                group: this.rootGroup,
                config
            }

            const renderer = new Renderer(entity, context)

            if (renderer.root) {
                this.rootGroup.addChild(renderer.root)
            }

            renderers.push(renderer)
        }

        this.#renderers.set(entity.$id, renderers)
    }


    #handleEntityDelete (entityId) {
        const renderers = this.#renderers.get(entityId)

        if (renderers) {
            for (const renderer of renderers) {
                renderer.dispose()
            }
            this.#renderers.delete(entityId)
        }
    }


    #disposeAllRenderers () {
        for (const renderers of this.#renderers.values()) {
            for (const renderer of renderers) {
                renderer.dispose()
            }
        }
        this.#renderers.clear()
    }


    #resolveRenderers (entity) {
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
