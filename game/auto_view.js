import EntityView from './entity_view.js'


export default class AutoView extends EntityView {

    #functionBindings = null
    #stringBindings = null

    constructor (entity, context) {
        super(entity, context)

        const config = context.config || {}
        const {sync, ...objectOptions} = config

        this.#compileBindings(sync)

        const ObjectClass = context.ObjectClass
        this.root = new ObjectClass({
            x: entity.x,
            y: entity.y,
            ...objectOptions
        })
    }


    #compileBindings (sync) {
        if (!sync) {
            return
        }

        for (const [prop, binding] of Object.entries(sync)) {
            if (prop === 'x' || prop === 'y') {
                continue
            }

            if (typeof binding === 'function') {
                if (!this.#functionBindings) {
                    this.#functionBindings = []
                }
                this.#functionBindings.push({prop, fn: binding})
            } else if (typeof binding === 'string') {
                if (!this.#stringBindings) {
                    this.#stringBindings = []
                }
                this.#stringBindings.push({prop, entityProp: binding})
            }
        }
    }


    sync (deltaTime) {
        super.sync(deltaTime)

        if (this.#stringBindings) {
            for (let i = 0; i < this.#stringBindings.length; i++) {
                const {prop, entityProp} = this.#stringBindings[i]
                this.root[prop] = this.entity[entityProp]
            }
        }

        if (this.#functionBindings) {
            for (let i = 0; i < this.#functionBindings.length; i++) {
                const {prop, fn} = this.#functionBindings[i]
                this.root[prop] = fn(this.entity, deltaTime)
            }
        }
    }

}
