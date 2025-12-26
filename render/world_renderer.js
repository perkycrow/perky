import PerkyModule from '../core/perky_module'
import Group2D from './group_2d'


const classRegistry = new Map()
const matcherRegistry = []


export default class WorldRenderer extends PerkyModule {

    static $category = 'worldRenderer'

    static matchersEnabled = true

    #renderers = new Map()

    constructor (options = {}) {
        super(options)

        this.world = options.world
        this.game = options.game
        this.layer = options.layer ?? null
        this.rootGroup = new Group2D({name: 'world'})
    }


    static register (classOrMatcher, Renderer, config = null, layer = null) {
        if (typeof classOrMatcher === 'function' && classOrMatcher.prototype) {
            const isClass = classOrMatcher.toString().startsWith('class ') ||
                            Object.getOwnPropertyNames(classOrMatcher.prototype).length > 1

            if (isClass) {
                classRegistry.set(classOrMatcher, {Renderer, config, layer})
                return
            }
        }

        matcherRegistry.push({matcher: classOrMatcher, Renderer, config, layer})
    }


    static unregister (classOrMatcher) {
        if (classRegistry.has(classOrMatcher)) {
            classRegistry.delete(classOrMatcher)
            return true
        }

        const index = matcherRegistry.findIndex(entry => entry.matcher === classOrMatcher)
        if (index !== -1) {
            matcherRegistry.splice(index, 1)
            return true
        }

        return false
    }


    static clearRegistry () {
        classRegistry.clear()
        matcherRegistry.length = 0
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
        const registrations = resolveRenderers(entity, WorldRenderer.matchersEnabled, this.layer)

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

}


function resolveRenderers (entity, matchersEnabled, targetLayer) {
    const results = []
    const EntityClass = entity.constructor

    const classRegistration = classRegistry.get(EntityClass)
    if (classRegistration && matchesLayer(classRegistration.layer, targetLayer)) {
        results.push(classRegistration)
    }

    if (matchersEnabled) {
        for (const entry of matcherRegistry) {
            if (entry.matcher(entity) && matchesLayer(entry.layer, targetLayer)) {
                results.push(entry)
            }
        }
    }

    return results
}


function matchesLayer (registrationLayer, targetLayer) {
    if (registrationLayer === null) {
        return targetLayer === null
    }
    return registrationLayer === targetLayer
}

