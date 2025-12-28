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

