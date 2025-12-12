import PerkyModule from '../core/perky_module'
import Registry from '../core/registry'


export default class World extends PerkyModule {

    #entities = new Registry()

    constructor () {
        super()

        this.#entities.addIndex('category', entity => entity.$category)
        this.#entities.addIndex('tags', entity => entity.$tags)
    }


    get entities () {
        return this.#entities
    }


    get size () {
        return this.#entities.size
    }


    addEntity (id, entity) {
        if (!entity.$category) {
            entity.$category = 'entity'
        }

        this.#entities.set(id, entity)
        return this
    }


    removeEntity (id) {
        return this.#entities.delete(id)
    }


    getEntity (id) {
        return this.#entities.get(id)
    }


    hasEntity (id) {
        return this.#entities.has(id)
    }


    clear () {
        this.#entities.clear()
    }


    byCategory (category) {
        return this.#entities.lookup('category', category)
    }


    byTag (tag) {
        return this.#entities.lookup('tags', tag)
    }


    forEach (callback, thisArg) {
        this.#entities.forEach(callback, thisArg)
    }

}
