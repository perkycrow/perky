
export default class Notifier {

    #listenersFor = {}
    #externalListeners = []

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


    once (name, listener) {
        if (typeof listener !== 'function') {
            throw new TypeError('Listener must be a function')
        }

        const onceWrapper = (...args) => {
            listener(...args)
            this.off(name, onceWrapper)
        }

        return this.on(name, onceWrapper)
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
        const listeners = this.getListenersFor(name)
        if (!listeners) {
            return
        }

        const listenersCopy = [...listeners]

        for (const listener of listenersCopy) {
            listener.call(this, ...args)
        }
    }


    emitter (name) {
        return (...args) => this.emit(name, ...args)
    }


    listenTo (target, eventName, callback) {
        target.on(eventName, callback)
        this.#externalListeners.push({target, eventName, callback})
    }


    listenToOnce (target, eventName, callback) {
        const onceWrapper = (...args) => {
            callback(...args)

            target.off(eventName, onceWrapper)

            const index = this.#externalListeners.findIndex(
                l => l.target === target && l.eventName === eventName && l.callback === onceWrapper
            )
            if (index !== -1) {
                this.#externalListeners.splice(index, 1)
            }
        }

        target.on(eventName, onceWrapper)
        this.#externalListeners.push({target, eventName, callback: onceWrapper})
    }


    cleanExternalListeners () {
        this.#externalListeners.forEach(({target, eventName, callback}) => {
            target.off(eventName, callback)
        })
        this.#externalListeners = []
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


    delegateEvents (target, events, namespace) {
        if (!target || (!Array.isArray(events) && typeof events !== 'object')) {
            return
        }

        const eventArray = Array.isArray(events) ? events : Object.keys(events)
        eventArray.forEach((event) => {
            this.listenTo(target, event, (...args) => {
                const prefixedEvent = namespace ? `${namespace}:${event}` : event
                this.emit(prefixedEvent, ...args)
            })
        })
    }

    static notifierMethods = [
        'getListenersFor',
        'on',
        'once',
        'off',
        'emit',
        'emitter',
        'listenTo',
        'listenToOnce',
        'cleanExternalListeners',
        'removeListeners',
        'removeListenersFor',
        'delegateEvents'
    ]

}
