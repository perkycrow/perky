import Notifier from './notifier'


export default class ObservableMap extends Notifier {

    #map = new Map()

    constructor (collection) {
        super()

        if (collection) {
            this.addCollection(collection)
        }
    }


    get size () {
        return this.#map.size
    }


    get entries () {
        return Array.from(this.#map.entries())
    }


    get keys () {
        return this.#map.keys()
    }


    get values () {
        return this.#map.values()
    }


    get all () {
        return Array.from(this.#map.values())
    }


    get map () {
        return this.#map
    }


    get (key) {
        return this.#map.get(key)
    }


    has (key) {
        return this.#map.has(key)
    }


    hasValue (value) {
        return Array.from(this.values).some((val) => val === value)
    }


    keyFor (value) {
        const {entries} = this

        for (const [key, val] of entries) {
            if (val === value) {
                return key
            }
        }

        return undefined
    }


    hasEntry (key, value) {
        return this.get(key) === value
    }


    isKeyOf (key, value) {
        return this.keyFor(value) === key
    }


    forEach (callbackFn, thisArg) {
        this.#map.forEach(callbackFn, thisArg)
    }


    set (key, value) {
        const exists = this.#map.has(key)
        const oldValue = exists ? this.#map.get(key) : undefined

        if (exists && oldValue !== value) {
            this.emit('delete', key, oldValue)
        }

        this.#map.set(key, value)
        this.emit('set', key, value, oldValue)

        return true
    }


    delete (key) {
        const exists = this.#map.has(key)

        if (!exists) {
            return false
        }

        const value = this.#map.get(key)
        const deleted = this.#map.delete(key)

        if (deleted) {
            this.emit('delete', key, value)
        }

        return deleted
    }


    updateKey (oldKey, newKey, item) {
        if (!this.has(oldKey)) {
            return false
        }

        if (oldKey === newKey) {
            return false
        }

        const value = this.get(oldKey)

        if (item !== undefined && value !== item) {
            return false
        }

        this.#map.delete(oldKey)
        this.#map.set(newKey, value)

        this.emit('key:updated', oldKey, newKey, value)

        return true
    }


    clear () {
        if (this.#map.size > 0) {
            const itemsToDelete = Array.from(this.#map.entries())
            itemsToDelete.forEach(([key, value]) => {
                this.emit('delete', key, value)
            })

            this.#map.clear()

            this.emit('clear')
        }
    }


    addCollection (collection) {
        if (!collection || typeof collection !== 'object') {
            return false
        }

        if (typeof collection.forEach === 'function') {
            collection.forEach((value, key) => {
                this.set(key, value)
            })
        } else {
            for (const key in collection) {
                if (Object.prototype.hasOwnProperty.call(collection, key)) {
                    this.set(key, collection[key])
                }
            }
        }

        return true
    }


    toObject () {
        const object = {}
        this.#map.forEach((value, key) => {
            object[key] = value
        })
        return object
    }

}
