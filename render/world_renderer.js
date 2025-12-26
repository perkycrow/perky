import PerkyModule from '../core/perky_module'
import Group2D from './group_2d'
import ImageRenderer from './image_renderer'
import CircleRenderer from './circle_renderer'


export default class WorldRenderer extends PerkyModule {

    static $category = 'worldRenderer'

    #renderers = new Map()

    constructor (options = {}) {
        super(options)

        this.world = options.world
        this.game = options.game
        this.rootGroup = new Group2D({name: 'world'})
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
        for (const renderer of this.#renderers.values()) {
            renderer.sync()
        }
    }


    getRenderer (entityId) {
        return this.#renderers.get(entityId)
    }


    #handleEntitySet (entity) {
        const Renderer = resolveRenderer(entity)

        if (!Renderer) {
            return
        }

        const context = {
            game: this.game,
            world: this.world,
            group: this.rootGroup
        }

        const renderer = new Renderer(entity, context)

        if (renderer.root) {
            this.rootGroup.addChild(renderer.root)
        }

        this.#renderers.set(entity.$id, renderer)
    }


    #handleEntityDelete (entityId) {
        const renderer = this.#renderers.get(entityId)

        if (renderer) {
            renderer.dispose()
            this.#renderers.delete(entityId)
        }
    }


    #disposeAllRenderers () {
        for (const renderer of this.#renderers.values()) {
            renderer.dispose()
        }
        this.#renderers.clear()
    }

}


function resolveRenderer (entity) {
    const EntityClass = entity.constructor

    if (EntityClass.Renderer) {
        return EntityClass.Renderer
    }

    if (EntityClass.renderable) {
        const {type} = EntityClass.renderable

        if (type === 'image') {
            return ImageRenderer
        }

        if (type === 'circle') {
            return CircleRenderer
        }
    }

    return null
}

