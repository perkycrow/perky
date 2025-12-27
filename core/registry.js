import ObservableMap from './observable_map'


export default class Registry extends ObservableMap {

    #indexes = new Map()

    constructor (collection) {
        super(collection)

        this.on('set', this.#handleSet)
        this.on('delete', this.#handleDelete)
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

        for (const value of this.map.values()) {
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
        for (const [k, v] of this.map.entries()) {
            if (itemsSet.has(v)) {
                keys.push(k)
            }
        }

        return keys
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
