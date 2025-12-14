import Notifier from './notifier'


export default class Registry extends Notifier {

    #map = new Map()
    #indexes = new Map()

    constructor (collection) {
        super()

        this.on('set', this.#handleSet)
        this.on('delete', this.#handleDelete)

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


    addIndex (name, keyFunction) {
        if (keyFunction === undefined) {
            keyFunction = name
        }

        if (typeof keyFunction === 'string') {
            const propertyName = keyFunction
            keyFunction = (item) => item[propertyName]
        }

        if (typeof keyFunction !== 'function') {
            return false
        }

        const index = {
            keyFn: keyFunction,
            data: new Map()
        }

        this.#indexes.set(name, index)

        for (const [, value] of this.entries) {
            this.#addToIndex(name, value)
        }

        return true
    }


    lookup (indexName, key) {
        const index = this.#indexes.get(indexName)

        if (!index) {
            throw new Error(`Index '${indexName}' does not exist`)
        }

        const items = index.data.get(key)
        return items ? Array.from(items) : []
    }


    lookupKeys (indexName, key) {
        const itemsSet = new Set(this.lookup(indexName, key))

        if (itemsSet.size === 0) {
            return []
        }

        const keys = []
        for (const [k, v] of this.#map.entries()) {
            if (itemsSet.has(v)) {
                keys.push(k)
            }
        }

        return keys
    }


    get all () {
        return Array.from(this.#map.values())
    }


    hasIndex (name) {
        return this.#indexes.has(name)
    }


    removeIndex (name) {
        return this.#indexes.delete(name)
    }


    updateIndexFor (item, indexName, oldKeys, newKeys) { // eslint-disable-line complexity
        if (!this.hasValue(item)) {
            return false
        }

        const index = this.#indexes.get(indexName)
        if (!index) {
            return false
        }

        const oldKeysArray = Array.isArray(oldKeys) ? oldKeys : [oldKeys]
        const newKeysArray = Array.isArray(newKeys) ? newKeys : [newKeys]

        for (const oldKey of oldKeysArray) {
            const items = index.data.get(oldKey)
            if (items) {
                items.delete(item)
                if (items.size === 0) {
                    index.data.delete(oldKey)
                }
            }
        }

        for (const newKey of newKeysArray) {
            if (!index.data.has(newKey)) {
                index.data.set(newKey, new Set())
            }
            index.data.get(newKey).add(item)
        }

        return true
    }


    refreshIndexFor (value, indexName) {
        if (!this.hasValue(value)) {
            return false
        }

        const index = this.#indexes.get(indexName)
        if (!index) {
            return false
        }

        for (const [key, items] of index.data.entries()) {
            if (items.has(value)) {
                items.delete(value)
                if (items.size === 0) {
                    index.data.delete(key)
                }
            }
        }

        this.#addToIndex(indexName, value)

        return true
    }


    #handleSet (key, value) {
        for (const indexName of this.#indexes.keys()) {
            this.#addToIndex(indexName, value)
        }
    }


    #handleDelete (key, value) {
        for (const indexName of this.#indexes.keys()) {
            this.#removeFromIndex(indexName, value)
        }
    }


    #addToIndex (indexName, value) {
        const index = this.#indexes.get(indexName)
        if (!index) {
            return
        }

        const keys = getKeysForValue(index.keyFn, value)

        for (const key of keys) {
            if (!index.data.has(key)) {
                index.data.set(key, new Set())
            }

            const items = index.data.get(key)
            items.add(value)
        }
    }


    #removeFromIndex (indexName, value) {
        const index = this.#indexes.get(indexName)
        if (!index) {
            return
        }

        const keys = getKeysForValue(index.keyFn, value)

        for (const key of keys) {
            const items = index.data.get(key)
            if (!items) {
                continue
            }

            items.delete(value)

            if (items.size === 0) {
                index.data.delete(key)
            }
        }
    }

}


function getKeysForValue (keyFn, value) {
    const result = keyFn(value)

    if (Array.isArray(result)) {
        return result
    }

    if (result === null || result === undefined) {
        return []
    }

    return [result]
}
