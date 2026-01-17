let docsRegistry = null
let guidesRegistry = null


export function initRegistry (docs, guides = []) {
    docsRegistry = new Map()
    guidesRegistry = new Map()

    for (const doc of docs) {
        const titleLower = doc.title.toLowerCase()
        docsRegistry.set(titleLower, doc)
    }

    for (const guide of guides) {
        const titleLower = guide.title.toLowerCase()
        guidesRegistry.set(titleLower, guide)
        guidesRegistry.set(guide.id, guide)
    }
}


export function lookupDoc (name) {
    if (!docsRegistry) {
        return null
    }
    return docsRegistry.get(name.toLowerCase()) || null
}


export function lookupGuide (name) {
    if (!guidesRegistry) {
        return null
    }
    return guidesRegistry.get(name.toLowerCase()) || null
}


export function isRegistryInitialized () {
    return docsRegistry !== null
}
