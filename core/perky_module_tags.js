export function getIndexKey (tags) {
    return [...tags].sort().join('_')
}


export function setupTagIndexListeners (host, child, tagIndexes, childrenRegistry) {
    if (tagIndexes.size === 0 || !child.tags) {
        return
    }

    const refreshAllIndexes = () => {
        for (const indexKey of tagIndexes.keys()) {
            childrenRegistry.refreshIndexFor(child, indexKey)
        }
    }

    child.listenTo(child.tags, 'add', refreshAllIndexes)
    child.listenTo(child.tags, 'delete', refreshAllIndexes)
    child.listenTo(child.tags, 'clear', refreshAllIndexes)
}


export function addTagsIndex (tags, tagIndexes, childrenRegistry, setupListenersFn) {
    if (!Array.isArray(tags) || tags.length === 0) {
        return false
    }

    const indexKey = getIndexKey(tags)

    if (tagIndexes.has(indexKey)) {
        return false
    }

    childrenRegistry.addIndex(indexKey, child => {
        const hasAllTags = tags.every(tag => child.tags?.has(tag))
        return hasAllTags ? indexKey : null
    })

    tagIndexes.set(indexKey, tags)

    childrenRegistry.forEach(child => {
        if (child.tags) {
            setupListenersFn(child)
        }
    })

    return true
}


export function removeTagsIndex (tags, tagIndexes, childrenRegistry) {
    const indexKey = getIndexKey(tags)

    if (!tagIndexes.has(indexKey)) {
        return false
    }

    childrenRegistry.removeIndex(indexKey)
    tagIndexes.delete(indexKey)
    return true
}


export function childrenByTags (tags, tagIndexes, childrenRegistry) {
    const tagArray = Array.isArray(tags) ? tags : [tags]

    if (tagArray.length === 0) {
        return []
    }

    const indexKey = getIndexKey(tagArray)

    if (tagIndexes.has(indexKey)) {
        return childrenRegistry.lookup(indexKey, indexKey)
    }

    return childrenRegistry.all.filter(child => tagArray.every(tag => child.$tags?.includes(tag)))
}

