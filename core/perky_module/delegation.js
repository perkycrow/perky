export function delegateProperties (receiver, source, names) {
    if (Array.isArray(names)) {
        names.forEach(name => delegateProperty(receiver, source, name, name))
    } else if (typeof names === 'object') {
        Object.entries(names).forEach(([sourceName, receiverName]) => {
            delegateProperty(receiver, source, sourceName, receiverName)
        })
    }
}


function delegateProperty (receiver, source, sourceName, receiverName) { // eslint-disable-line complexity
    const descriptor = Object.getOwnPropertyDescriptor(source, sourceName)

    if (descriptor && (descriptor.get || descriptor.set)) {
        Object.defineProperty(receiver, receiverName, {
            get: descriptor.get ? descriptor.get.bind(source) : undefined,
            set: descriptor.set ? descriptor.set.bind(source) : undefined,
            enumerable: true,
            configurable: true
        })
    } else if (typeof source[sourceName] === 'function') {
        receiver[receiverName] = source[sourceName].bind(source)
    } else {
        Object.defineProperty(receiver, receiverName, {
            get: () => source[sourceName],
            set: (value) => {
                source[sourceName] = value
            },
            enumerable: true,
            configurable: true
        })
    }
}


export function delegateTo (host, names) {
    delegateProperties(host, this, names)

    const propertyNames = Array.isArray(names) ? names : Object.values(names)

    this.delegations.push({host, propertyNames})
}


export function cleanDelegations () {
    for (const {host, propertyNames} of this.delegations) {
        for (const name of propertyNames) {
            delete host[name]
        }
    }
    this.delegations.length = 0
}


export function delegateEventsTo (host, events, namespace) {
    const eventArray = Array.isArray(events) ? events : Object.keys(events)
    const callbacks = []

    for (const event of eventArray) {
        const prefixedEvent = namespace ? `${namespace}:${event}` : event
        const callback = (...args) => host.emit(prefixedEvent, ...args)
        this.on(event, callback)
        callbacks.push({event, callback})
    }

    this.eventDelegations.push({callbacks})
}


export function cleanEventDelegations () {
    for (const {callbacks} of this.eventDelegations) {
        for (const {event, callback} of callbacks) {
            this.off(event, callback)
        }
    }
    this.eventDelegations.length = 0
}
