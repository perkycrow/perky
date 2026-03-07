const EFFECTS = {
    fear: {
        speed: 1.3,
        damage: 0.8,
        detectRange: 1.5,
        fleeWeight: 2,
        approachWeight: 0.3
    },
    sadness: {
        speed: 0.7,
        damage: 0.8,
        wanderWeight: 0.4,
        socialWeight: 2
    },
    anger: {
        speed: 1.3,
        damage: 1.5,
        cooldown: 0.7,
        approachWeight: 2,
        fleeWeight: 0.2
    },
    arrogance: {
        damage: 1.4,
        cooldown: 0.8,
        approachWeight: 1.5,
        socialWeight: 0.3,
        fleeWeight: 0.3
    },
    naive: {
        speed: 1.2,
        damage: 0.7,
        wanderWeight: 2,
        approachWeight: 1.3,
        fleeWeight: 0.2
    },
    surprise: {
        speed: 0.8,
        detectRange: 1.8,
        damage: 1.3
    },
    lust: {
        speed: 1.15,
        socialWeight: 2,
        approachWeight: 1.3,
        damage: 0.8
    }
}


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

    return result
}


export function getSporeValue (entity, stat, baseValue) {
    return baseValue * getSporeModifier(entity, stat)
}
