export function unregisterExisting (host, childName) {
    const children = host.childrenRegistry

    if (children.has(childName)) {
        unregisterChild(host, children.get(childName))
    }
}


export function unregisterChild (host, child) {
    if (host.childrenRegistry.hasEntry(child.$id, child)) {
        host.childrenRegistry.delete(child.$id)
    }

    if (child.$bind && host[child.$bind] === child) {
        delete host[child.$bind]
    }

    child.uninstall()

    host.emit(`${child.$category}:delete`, child.$id, child)
    child.emit('unregistered', host, child.$id)

    child.dispose()
}

