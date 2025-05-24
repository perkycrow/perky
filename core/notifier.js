export default class Notifier {

    #listenersFor = {}

    getListenersFor (name) {
        return this.#listenersFor[name]
    }


    on (name, listener) {
        if (typeof listener !== 'function') {
            throw new TypeError('Listener must be a function')
        }

        if (!this.#listenersFor[name]) {
            this.#listenersFor[name] = []
        }

        this.#listenersFor[name].push(listener)

        return listener
    }


    off (name, listener) {
        const listeners = this.getListenersFor(name)

        if (typeof listener === 'undefined') {
            return this.removeListenersFor(name)
        } else if (Array.isArray(listeners)) {
            const index = listeners.indexOf(listener)

            if (index !== -1) {
                listeners.splice(index, 1)
                return true
            }
        }

        return false
    }


    emit (name, ...args) {
        const listeners = this.getListenersFor(name) || []

        for (let listener of listeners) {
            listener(...args)
        }
    }


    async emitAsync (name, ...args) {
        const listeners = this.getListenersFor(name) || []

        for (let listener of listeners) {
            await Promise.resolve(listener(...args))
        }
    }


    emitCallbacks (name, ...args) {
        const listeners = this.getListenersFor(name) || []
        for (let listener of listeners) {
            const result = listener(...args)

            if (result === false) {
                return false
            }
        }

        return true
    }


    async emitCallbacksAsync (name, ...args) {
        const listeners = this.getListenersFor(name) || []

        for (let listener of listeners) {
            const result = await Promise.resolve(listener(...args))

            if (result === false) {
                return false
            }
        }

        return true
    }


    emitter (name) {
        return (...args) => this.emit(name, ...args)
    }


    removeListeners () {
        Object.keys(this.#listenersFor).forEach(name => this.removeListenersFor(name))
    }


    removeListenersFor (name) {
        const listeners = this.getListenersFor(name)

        if (listeners) {
            listeners.length = 0
            delete this.#listenersFor[name]
            return true
        }

        return false
    }


    static notifierMethods = ['on', 'off', 'emit', 'emitter', 'removeListeners', 'removeListenersFor']


    static addCapabilitiesTo (target) {
        if (!(target instanceof Object)) {
            throw new TypeError('Target must be an object')
        }

        const notifier = new Notifier()
        target.notifier = notifier

        for (let method of Notifier.notifierMethods) {
            target[method] = notifier[method].bind(notifier)
        }
    }

}
