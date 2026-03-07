import {IMPRINT_STRENGTH} from './spores.js'
import {SPORE_DEFINITIONS} from './spores/index.js'


const EFFECTS = Object.fromEntries(
    Object.entries(SPORE_DEFINITIONS).map(([key, def]) => [key, def.effects])
)


export function getSporeModifier (entity, stat) {
    if (!entity.spores) {
        return 1
    }

    let result = 1

    for (const key in entity.spores) {
        const count = entity.spores[key]

        if (count <= 0) {
            continue
        }

        const effects = EFFECTS[key]

        if (!effects || !(stat in effects)) {
            continue
        }

        const base = effects[stat]
        const deviation = base - 1
        result *= 1 + deviation * count
    }

    return result * getImprintModifier(entity, stat)
}


function getImprintModifier (entity, stat) {
    if (!entity.imprint) {
        return 1
    }

    let total = 0

    for (const key in entity.imprint) {
        total += entity.imprint[key]
    }

    if (total <= 0) {
        return 1
    }

    let result = 1

    for (const key in entity.imprint) {
        const weight = entity.imprint[key] / total
        const effects = EFFECTS[key]

        if (!effects || !(stat in effects)) {
            continue
        }

        const deviation = effects[stat] - 1
        result *= 1 + deviation * IMPRINT_STRENGTH * weight
    }

    return result
}


export function getSporeValue (entity, stat, baseValue) {
    return baseValue * getSporeModifier(entity, stat)
}
