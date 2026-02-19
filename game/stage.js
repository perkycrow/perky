import PerkyModule from '../core/perky_module.js'
import Group2D from '../render/group_2d.js'
import Object2D from '../render/object_2d.js'
import AutoView from './auto_view.js'


export default class Stage extends PerkyModule {

    static $category = 'stage'
    static World = null
    static ActionController = null
    static camera = null
    static postPasses = null

    #viewClassRegistry = new Map()
    #viewMatcherRegistry = []
    #entityViews = new Map()
    #runtimePostPasses = []

    constructor (options = {}) {
        super(options)

        this.game = options.game
        this.viewsGroup = new Group2D()

        this.#createWorld()
        this.on('stop', this.#cleanupRuntimePostPasses)
    }


    #createWorld () {
        const WorldClass = this.constructor.World

        if (!WorldClass) {
            return
        }

        this.create(WorldClass, {$bind: 'world'})
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
                this.#viewClassRegistry.set(classOrMatcher, registration)
                return this
            }
        }

        this.#viewMatcherRegistry.push({matcher: classOrMatcher, ...registration})
        return this
    }


    unregister (classOrMatcher) {
        if (this.#viewClassRegistry.has(classOrMatcher)) {
            this.#viewClassRegistry.delete(classOrMatcher)
            return true
        }

        const index = this.#viewMatcherRegistry.findIndex(entry => entry.matcher === classOrMatcher)
        if (index !== -1) {
            this.#viewMatcherRegistry.splice(index, 1)
            return true
        }

        return false
    }


    clearRegistry () {
        this.#viewClassRegistry.clear()
        this.#viewMatcherRegistry.length = 0
        return this
    }


    getViews (entityId) {
        return this.#entityViews.get(entityId) || []
    }


    updateViews (deltaTime) {
        for (const views of this.#entityViews.values()) {
            for (const view of views) {
                view.update?.(deltaTime)
            }
        }
    }


    syncViews () {
        for (const views of this.#entityViews.values()) {
            for (const view of views) {
                view.sync()
            }
        }
    }


    update (deltaTime) {
        this.updateViews(deltaTime)
    }


    render () {

    }


    #bindWorldEvents () {
        if (!this.world) {
            return
        }

        this.#bindEntitySource(this.world, this.viewsGroup)
    }


    #bindEntitySource (source, parentGroup) {
        this.listenTo(source, 'entity:set', (id, entity) => {
            this.#handleEntitySet(entity, parentGroup)
        })

        this.listenTo(source, 'entity:delete', (id) => {
            this.#handleEntityDelete(id)
        })

        for (const entity of source.childrenByCategory('entity')) {
            this.#handleEntitySet(entity, parentGroup)
        }
    }


    #handleEntitySet (entity, parentGroup) {
        const registrations = this.#resolveViews(entity)

        if (registrations.length === 0) {
            this.#bindEntitySource(entity, parentGroup)
            return
        }

        const views = []

        for (const {View, config, ObjectClass} of registrations) {
            const mergedConfig = {...View.config, ...config}
            const context = {
                game: this.game,
                world: this.world,
                group: parentGroup,
                config: mergedConfig,
                ObjectClass
            }

            const view = new View(entity, context)

            if (view.root) {
                view.root.$entity = entity
                view.root.$view = view
                view.root.$viewName = ObjectClass ? ObjectClass.name : View.name
                parentGroup.addChild(view.root)
            }

            views.push(view)
        }

        this.#entityViews.set(entity.$id, views)
        this.emit('view:added', entity.$id, views)

        const childGroup = views[0]?.root || parentGroup
        this.#bindEntitySource(entity, childGroup)
    }


    #handleEntityDelete (entityId) {
        const views = this.#entityViews.get(entityId)

        if (views) {
            this.emit('view:removed', entityId, views)
            for (const view of views) {
                view.dispose()
            }
            this.#entityViews.delete(entityId)
        }
    }


    #disposeAllViews () {
        for (const views of this.#entityViews.values()) {
            for (const view of views) {
                view.dispose()
            }
        }
        this.#entityViews.clear()
    }


    addPostPass (PassClass) {
        const renderer = this.game?.getRenderer('game')
        const pass = renderer?.addPostPass(PassClass)
        if (pass) {
            this.#runtimePostPasses.push(pass)
        }
        return pass
    }


    removePostPass (pass) {
        const renderer = this.game?.getRenderer('game')
        renderer?.removePostPass(pass)
        const index = this.#runtimePostPasses.indexOf(pass)
        if (index !== -1) {
            this.#runtimePostPasses.splice(index, 1)
        }
    }


    #cleanupRuntimePostPasses () {
        const renderer = this.game?.getRenderer('game')
        for (const pass of this.#runtimePostPasses) {
            renderer?.removePostPass(pass)
        }
        this.#runtimePostPasses = []
    }


    #resolveViews (entity) {
        const results = []
        const EntityClass = entity.constructor

        const classRegistration = this.#viewClassRegistry.get(EntityClass)
        if (classRegistration) {
            results.push(classRegistration)
        }

        for (const entry of this.#viewMatcherRegistry) {
            if (entry.matcher(entity)) {
                results.push(entry)
            }
        }

        return results
    }

}


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
