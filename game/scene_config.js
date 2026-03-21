export function loadScene (config, world, wiring) {
    if (!config || !world || !wiring) {
        return []
    }

    const entities = []

    for (const entry of config.entities || []) {
        const entity = loadEntity(entry, world, wiring)

        if (entity) {
            entities.push(entity)
        }
    }

    return entities
}


export function serializeScene (world, wiring) {
    const entities = []

    for (const entity of world.entities) {
        const entry = serializeEntity(entity, wiring)

        if (entry) {
            entities.push(entry)
        }
    }

    return {entities}
}


function loadEntity (entry, parent, wiring) {
    const EntityClass = wiring.get('entities', entry.type)

    if (!EntityClass) {
        return null
    }

    const options = {...entry}
    delete options.type

    return parent.create(EntityClass, options)
}


function serializeEntity (entity, wiring) {
    const type = resolveTypeName(entity, wiring)

    if (!type) {
        return null
    }

    const entry = {type}

    if (entity.x !== 0) {
        entry.x = entity.x
    }

    if (entity.y !== 0) {
        entry.y = entity.y
    }

    const defaultId = entity.constructor.$name || entity.constructor.name
    if (entity.$id && entity.$id !== defaultId && entity.$id !== entity.$category) {
        entry.$id = entity.$id
    }

    return entry
}


function resolveTypeName (entity, wiring) {
    const allEntities = wiring.getAll('entities')

    for (const [name, EntityClass] of Object.entries(allEntities)) {
        if (entity.constructor === EntityClass) {
            return name
        }
    }

    return null
}
