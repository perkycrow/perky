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


export function getChild (name) {
    return this.childrenRegistry.get(name) || null
}


export function hasChild (name) {
    return this.childrenRegistry.has(name)
}


export function listNamesFor (key, indexName = '$category') {
    return this.childrenRegistry.lookupKeys(indexName, key)
}


export function removeChild (name) {
    const child = this.childrenRegistry.get(name)

    if (!child) {
        return false
    }

    unregisterChild(this, child)

    return true
}


export function lookup (indexName, key) {
    return this.childrenRegistry.lookup(indexName, key)
}


export function childrenByCategory (category) {
    return this.lookup('$category', category)
}
