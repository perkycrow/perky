import Registry from './registry'


export default class IndexedRegistry extends Registry {

    #indexes = new Map()

    constructor (collection) {
        super(collection)

        this.on('set', this.#handleSet)
        this.on('delete', this.#handleDelete)
    }


    addIndex (name, keyFunction) {
        if (typeof keyFunction !== 'function') {
            throw new TypeError('keyFunction must be a function')
        }

        const index = {
            keyFn: keyFunction,
            data: new Map()
        }

        this.#indexes.set(name, index)

        for (const [, value] of this.entries) {
            this.#addToIndex(name, value)
        }

        return this
    }


    lookup (indexName, key) {
        const index = this.#indexes.get(indexName)

        if (!index) {
            throw new Error(`Index '${indexName}' does not exist`)
        }

        return index.data.get(key) || []
    }


    hasIndex (name) {
        return this.#indexes.has(name)
    }


    removeIndex (name) {
        return this.#indexes.delete(name)
    }


    #handleSet (key, value, oldValue) {
        if (oldValue !== undefined) {
            for (const indexName of this.#indexes.keys()) {
                this.#removeFromIndex(indexName, oldValue)
            }
        }

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
                index.data.set(key, [])
            }

            const items = index.data.get(key)
            if (!items.includes(value)) {
                items.push(value)
            }
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

            const idx = items.indexOf(value)
            if (idx !== -1) {
                items.splice(idx, 1)
            }

            if (items.length === 0) {
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