import PerkyModule from '../core/perky_module'
import Registry from '../core/registry'
import {uniqueId} from '../core/utils'


export default class World extends PerkyModule {

    #entities = new Registry()

    constructor (options = {}) {
        super(options)

        this.#entities.addIndex('category', entity => entity.$category)
        this.#entities.addIndex('tags', entity => entity.$tags)
    }


    get entities () {
        return this.#entities
    }


    get size () {
        return this.#entities.size
    }


    addEntity (idOrEntity, entity) {
        const hasExplicitId = typeof idOrEntity === 'string'
        entity ||= idOrEntity

        if (hasExplicitId) {
            entity.$id = idOrEntity
        }

        entity.$category ||= 'entity'
        entity.$id ||= uniqueId('world', entity.$category)

        this.#entities.set(entity.$id, entity)
    }


    removeEntity (idOrEntity) {
        const id = typeof idOrEntity === 'object' ? idOrEntity.$id : idOrEntity
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
