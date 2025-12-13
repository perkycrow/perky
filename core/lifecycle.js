export default class Lifecycle {

    instance = null
    #started = false
    #disposed = false

    constructor (instance) {
        this.instance = instance
    }


    get started () {
        return this.#started
    }


    get disposed () {
        return this.#disposed
    }


    start () {
        if (this.#started) {
            return false
        }

        this.#started = true
        this.instance.start?.()
        this.instance.emit('start')

        return true
    }


    stop () {
        if (!this.#started) {
            return false
        }

        this.#started = false
        this.instance.stop?.()
        this.instance.emit('stop')

        return true
    }


    dispose () {
        if (this.#disposed) {
            return false
        }

        this.#disposed = true
        this.stop()

        const children = this.instance.childrenRegistry
        children.forEach(child => {
            if (child && !child.disposed) {
                child.lifecycle.dispose()
            }
        })
        children.clear()

        this.instance.dispose?.()
        this.instance.emit('dispose')
        this.instance.removeListeners()

        return true
    }

}
