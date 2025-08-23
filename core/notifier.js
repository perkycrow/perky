/**
 * A simple event emitter that allows subscribing to events and emitting them to listeners.
 * Provides both synchronous and asynchronous event handling capabilities.
 */
export default class Notifier {

    #listenersFor = {}

    /**
     * Gets the array of listeners registered for a specific event name.
     * @param {string} name - The event name
     * @returns {Function[]|undefined} Array of listener functions, or undefined if no listeners exist
     */
    getListenersFor (name) {
        return this.#listenersFor[name]
    }


    /**
     * Registers a listener function for a specific event name.
     * @param {string} name - The event name to listen to
     * @param {Function} listener - The function to call when the event is emitted
     * @returns {Function} The listener function that was added
     * @throws {TypeError} If listener is not a function
     */
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

    
    /**
     * Registers a listener function for a specific event name that will be called only once.
     * @param {string} name - The event name to listen to
     * @param {Function} listener - The function to call when the event is emitted
     * @returns {Function} The listener function that was added
     * @throws {TypeError} If listener is not a function
     */
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


    /**
     * Removes a listener for a specific event. If no listener is provided, removes all listeners for the event.
     * @param {string} name - The event name
     * @param {Function} [listener] - The specific listener to remove. If not provided, all listeners are removed
     * @returns {boolean} True if listener(s) were removed, false otherwise
     */
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


    /**
     * Emits an event to all registered listeners synchronously.
     * @param {string} name - The event name to emit
     * @param {...any} args - Arguments to pass to the listener functions
     */
    emit (name, ...args) {
        const listeners = this.getListenersFor(name) || []

        for (let listener of listeners) {
            listener(...args)
        }
    }


    /**
     * Emits an event to all registered listeners asynchronously, waiting for each listener to complete.
     * @param {string} name - The event name to emit
     * @param {...any} args - Arguments to pass to the listener functions
     * @returns {Promise<void>} Promise that resolves when all listeners have completed
     */
    async emitAsync (name, ...args) {
        const listeners = this.getListenersFor(name) || []

        for (let listener of listeners) {
            await Promise.resolve(listener(...args))
        }
    }


    /**
     * Emits an event and checks listener return values. Stops if any listener returns false.
     * @param {string} name - The event name to emit
     * @param {...any} args - Arguments to pass to the listener functions
     * @returns {boolean} False if any listener returned false, true otherwise
     */
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


    /**
     * Emits an event asynchronously and checks listener return values. Stops if any listener returns false.
     * @param {string} name - The event name to emit
     * @param {...any} args - Arguments to pass to the listener functions
     * @returns {Promise<boolean>} Promise that resolves to false if any listener returned false, true otherwise
     */
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


    /**
     * Creates a bound emitter function for a specific event name.
     * @param {string} name - The event name
     * @returns {Function} A function that when called, emits the event with the provided arguments
     */
    emitter (name) {
        return (...args) => this.emit(name, ...args)
    }


    /**
     * Removes all listeners for all events.
     */
    removeListeners () {
        Object.keys(this.#listenersFor).forEach(name => this.removeListenersFor(name))
    }


    /**
     * Removes all listeners for a specific event name.
     * @param {string} name - The event name
     * @returns {boolean} True if listeners were removed, false if no listeners existed
     */
    removeListenersFor (name) {
        const listeners = this.getListenersFor(name)

        if (listeners) {
            listeners.length = 0
            delete this.#listenersFor[name]
            return true
        }

        return false
    }


    /**
     * Array of method names that can be added to target objects via addCapabilitiesTo.
     * @type {string[]}
     */
    static notifierMethods = ['on', 'off', 'emit', 'emitter', 'removeListeners', 'removeListenersFor']


    /**
     * Adds Notifier capabilities to a target object by creating a Notifier instance
     * and binding its methods to the target object.
     * @param {Object} target - The object to add notifier capabilities to
     * @throws {TypeError} If target is not an object
     * @example
     * const myObject = {}
     * Notifier.addCapabilitiesTo(myObject)
     * myObject.on('test', () => console.log('Event fired!'))
     * myObject.emit('test')
     */
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
