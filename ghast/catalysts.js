const CATALYSTS = {

    'anger+fear': {
        name: 'cornered',
        reactions: {
            low_hp: 'cornered',
            surrounded: 'cornered',
            ally_died: 'panic'
        }
    },

    'anger+sadness': {
        name: 'vendetta',
        reactions: {
            ally_died: 'vendetta',
            isolated: 'vendetta',
            low_hp: 'lastBreath'
        }
    },

    'anger+arrogance': {
        name: 'duelFury',
        reactions: {
            first_blood: 'duelFury',
            kill: 'duelFury',
            low_hp: 'indignation'
        }
    },

    'anger+naive': {
        name: 'berserk',
        reactions: {
            first_blood: 'berserk',
            surrounded: 'berserk',
            ally_died: 'berserk'
        }
    },

    'anger+surprise': {
        name: 'explosive',
        reactions: {
            surrounded: 'detonation',
            first_blood: 'detonation',
            low_hp: 'detonation'
        }
    },

    'anger+lust': {
        name: 'possessive',
        reactions: {
            kill: 'possessive',
            ally_died: 'rage',
            isolated: 'possessive'
        }
    },

    'arrogance+fear': {
        name: 'cowardTyrant',
        reactions: {
            surrounded: 'cowardTyrant',
            low_hp: 'panic',
            kill: 'triumph'
        }
    },

    'arrogance+naive': {
        name: 'megalomaniac',
        reactions: {
            first_blood: 'megalomania',
            kill: 'megalomania',
            surrounded: 'megalomania'
        }
    },

    'arrogance+sadness': {
        name: 'nobleMelancholy',
        reactions: {
            ally_died: 'nobleMelancholy',
            isolated: 'nobleMelancholy',
            low_hp: 'indignation'
        }
    },

    'arrogance+surprise': {
        name: 'snobShocked',
        reactions: {
            low_hp: 'snobShock',
            surrounded: 'snobShock',
            first_blood: 'shock'
        }
    },

    'arrogance+lust': {
        name: 'seducer',
        reactions: {
            kill: 'seduction',
            first_blood: 'seduction',
            surrounded: 'triumph'
        }
    },

    'fear+lust': {
        name: 'obsession',
        reactions: {
            isolated: 'obsession',
            surrounded: 'panic',
            low_hp: 'obsession'
        }
    },

    'fear+naive': {
        name: 'unstable',
        reactions: {
            surrounded: 'unstable',
            isolated: 'excitement',
            low_hp: 'panic'
        }
    },

    'fear+sadness': {
        name: 'despair',
        reactions: {
            ally_died: 'despair',
            surrounded: 'despair',
            low_hp: 'despair'
        }
    },

    'fear+surprise': {
        name: 'terrorFreeze',
        reactions: {
            surrounded: 'terrorFreeze',
            first_blood: 'terrorFreeze',
            low_hp: 'panic'
        }
    },

    'lust+naive': {
        name: 'groupie',
        reactions: {
            first_blood: 'groupie',
            kill: 'groupie',
            isolated: 'excitement'
        }
    },

    'lust+sadness': {
        name: 'dependence',
        reactions: {
            ally_died: 'dependence',
            isolated: 'dependence',
            low_hp: 'grief'
        }
    },

    'lust+surprise': {
        name: 'loveStrike',
        reactions: {
            first_blood: 'loveStrike',
            surrounded: 'loveStrike',
            kill: 'trophy'
        }
    },

    'naive+sadness': {
        name: 'bipolar',
        reactions: {
            ally_died: 'bipolar',
            kill: 'excitement',
            isolated: 'grief'
        }
    },

    'naive+surprise': {
        name: 'wonder',
        reactions: {
            first_blood: 'wonder',
            surrounded: 'wonder',
            kill: 'excitement'
        }
    },

    'sadness+surprise': {
        name: 'apathy',
        reactions: {
            ally_died: 'apathy',
            surrounded: 'apathy',
            low_hp: 'apathy'
        }
    }

}


export function getDominantPair (entity) {
    if (!entity.spores) {
        return null
    }

    let first = null
    let firstVal = 0
    let second = null
    let secondVal = 0

    for (const key in entity.spores) {
        const val = entity.spores[key]

        if (val <= 0) {
            continue
        }

        if (val > firstVal) {
            second = first
            secondVal = firstVal
            first = key
            firstVal = val
        } else if (val > secondVal) {
            second = key
            secondVal = val
        }
    }

    if (!first || !second) {
        return null
    }

    return first < second ? first + '+' + second : second + '+' + first
}


export function getCatalystReactions (entity) {
    const pair = getDominantPair(entity)

    if (!pair) {
        return null
    }

    const catalyst = CATALYSTS[pair]

    return catalyst ? catalyst.reactions : null
}
