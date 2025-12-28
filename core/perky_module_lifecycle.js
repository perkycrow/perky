import {unregisterChild} from './perky_module_children.js'


export function setupLifecycle (host, child, options) {
    const {$lifecycle = true} = options

    if (!$lifecycle) {
        return
    }

    const childrenRegistry = host.childrenRegistry

    if (host.started && child.$eagerStart) {
        child.start()
    }

    child.listenTo(host, 'start', () => {
        child.start()
    })

    child.listenTo(host, 'stop', () => {
        child.stop()
    })

    child.listenTo(host, 'dispose', () => {
        if (childrenRegistry.hasEntry(child.$id, child)) {
            unregisterChild(host, child)
        }
    })

    child.once('dispose', () => {
        if (childrenRegistry.hasEntry(child.$id, child)) {
            unregisterChild(host, child)
        }
    })

    child.on('$category:changed', (newCategory, oldCategory) => {
        childrenRegistry.updateIndexFor(child, '$category', oldCategory, newCategory)
    })

    child.on('$id:changed', (newName, oldName) => {
        childrenRegistry.updateKey(oldName, newName, child)
    })

    child.on('$bind:changed', (newBind, oldBind) => {
        if (oldBind && host[oldBind] === child) {
            delete host[oldBind]
        }

        if (newBind) {
            host[newBind] = child
        }
    })
}

