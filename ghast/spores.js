import {SPORE_LIST} from './spores/index.js'


export const SPORE_TYPES = SPORE_LIST


export const DECAY_RATE = 0

export const IMPRINT_STRENGTH = 0.3


export function createSporeStorage () {
    const spores = {}
    for (const {key} of SPORE_TYPES) {
        spores[key] = 0
    }
    return spores
}


export function createImprintStorage () {
    const imprint = {}
    for (const {key} of SPORE_TYPES) {
        imprint[key] = 0
    }
    return imprint
}


export function addSpore (entity, key) {
    if (entity.spores[key] === undefined) {
        return false
    }

    if (entity.rank !== undefined && getSporeCount(entity) >= entity.rank) {
        return false
    }

    entity.spores[key]++
    return true
}


export function getSporeCount (entity) {
    let total = 0
    for (const key in entity.spores) {
        total += entity.spores[key]
    }
    return total
}
