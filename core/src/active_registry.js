import Notifier from './notifier'


export default class ActiveRegistry extends Notifier {

    constructor () {
        super()
        this.map = new Map()
    }


    get (key) {
        return this.map.get(key)
    }


    has (key) {
        return this.map.has(key)
    }


    forEach (callbackFn, thisArg) {
        this.map.forEach(callbackFn, thisArg)
    }


    get size () {
        return this.map.size
    }


    keys () {
        return this.map.keys()
    }


    values () {
        return this.map.values()
    }


    entries () {
        return this.map.entries()
    }


    set (key, value) {
        const exists = this.map.has(key)
        const oldValue = exists ? this.map.get(key) : undefined
        this.map.set(key, value)
        this.emit('set', key, value, oldValue)

        return this
    }


    delete (key) {
        const exists = this.map.has(key)

        if (!exists) {
            return false
        }

        const value = this.map.get(key)
        const deleted = this.map.delete(key)

        if (deleted) {
            this.emit('delete', key, value)
        }

        return deleted
    }


    clear () {
        if (this.map.size > 0) {
            const itemsToDelete = Array.from(this.map.entries())
            itemsToDelete.forEach(([key, value]) => {
                this.emit('delete', key, value)
            })

            this.map.clear()
            
            this.emit('clear') 
        }
    }


    invoke (methodName, ...args) {
        this.map.forEach((item) => {
            if (item && typeof item[methodName] === 'function') {
                try {
                    item[methodName](...args)
                } catch (error) {
                    console.error(`Error invoking ${methodName} on item:`, item, error)
                }
            }
        })
    }


    reverseInvoke (methodName, ...args) {
        const items = Array.from(this.map.values()).reverse()

        items.forEach((item) => {
            if (item && typeof item[methodName] === 'function') {
                try {
                    item[methodName](...args)
                } catch (error) {
                    console.error(`Error reverse invoking ${methodName} on item:`, item, error)
                }
            }
        })
    }


    invoker (methodName) {
        return (...args) => {
            this.invoke(methodName, ...args)
        }
    }


    reverseInvoker (methodName) {
        return (...args) => {
            this.reverseInvoke(methodName, ...args)
        }
    }


    addCollection (collection) {
        if (!collection || typeof collection !== 'object') {
            throw new Error('Collection must be an object or Map')
        }
        
        if (collection instanceof Map) {
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
        return this
    }


    toObject () {
        const object = {}
        this.map.forEach((value, key) => {
            object[key] = value
        })
        return object
    }

}
