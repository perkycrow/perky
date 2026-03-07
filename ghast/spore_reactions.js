import BUFF_DEFINITIONS from './buff_definitions.js'


const REACTIONS = {

    ally_died: {
        anger: 'rage',
        sadness: 'grief',
        fear: 'panic',
        surprise: 'shock'
    },

    low_hp: {
        fear: 'terror',
        anger: 'lastBreath',
        arrogance: 'indignation'
    },

    kill: {
        arrogance: 'triumph',
        naive: 'excitement',
        lust: 'trophy'
    },

    surrounded: {
        fear: 'panic',
        naive: 'party',
        surprise: 'startle'
    }

}


export function applySporeReactions (entity, eventType) {
    if (!entity.spores || !entity.applyBuff) {
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
