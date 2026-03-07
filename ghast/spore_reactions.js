import BUFF_DEFINITIONS from './buff_definitions.js'
import {getCatalystReactions} from './catalysts.js'
import {SPORE_LIST} from './spores/index.js'


const REACTIONS = buildReactions()


function buildReactions () {
    const result = {}

    for (const spore of SPORE_LIST) {
        if (!spore.reactions) {
            continue
        }

        for (const [event, buff] of Object.entries(spore.reactions)) {
            if (!result[event]) {
                result[event] = {}
            }

            result[event][spore.key] = buff
        }
    }

    return result
}


export function applySporeReactions (entity, eventType) {
    if (!entity.spores || !entity.applyBuff) {
        return
    }

    const catalystReactions = getCatalystReactions(entity)

    if (catalystReactions && catalystReactions[eventType]) {
        const buffKey = catalystReactions[eventType]
        const definition = BUFF_DEFINITIONS[buffKey]

        if (definition) {
            entity.applyBuff(definition.key, definition.duration, {...definition.modifiers})
        }

        return
    }

    const reactions = REACTIONS[eventType]

    if (!reactions) {
        return
    }

    for (const sporeKey in reactions) {
        if (entity.spores[sporeKey] <= 0) {
            continue
        }

        const buffKey = reactions[sporeKey]
        const definition = BUFF_DEFINITIONS[buffKey]

        if (definition) {
            entity.applyBuff(definition.key, definition.duration, {...definition.modifiers})
        }
    }
}


export function applySwarmReaction (swarm, buffKey) {
    const definition = BUFF_DEFINITIONS[buffKey]

    if (!definition || !swarm.applyBuff) {
        return
    }

    swarm.applyBuff(definition.key, definition.duration, {...definition.modifiers})
}


export {REACTIONS}
