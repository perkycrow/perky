import Notifier from './notifier'


export default class ObservableSet extends Notifier {

    #set = new Set()

    constructor (values) {
        super()

        if (values) {
            for (const value of values) {
                this.#set.add(value)
            }
        }
    }


    get size () {
        return this.#set.size
    }


    add (value) {
        if (!this.#set.has(value)) {
            this.#set.add(value)
            this.emit('add', value)
        }
        return this
    }


    delete (value) {
        const deleted = this.#set.delete(value)
        if (deleted) {
            this.emit('delete', value)
        }
        return deleted
    }


    clear () {
        if (this.#set.size > 0) {
            const values = Array.from(this.#set)
            this.#set.clear()
            this.emit('clear', values)
        }
    }


    has (value) {
        return this.#set.has(value)
    }


    values () {
        return this.#set.values()
    }


    keys () {
        return this.#set.keys()
    }


    entries () {
        return this.#set.entries()
    }


    forEach (callbackFn, thisArg) {
        this.#set.forEach(callbackFn, thisArg)
    }


    [Symbol.iterator] () {
        return this.#set[Symbol.iterator]()
    }


    toArray () {
        return Array.from(this.#set)
    }

}
