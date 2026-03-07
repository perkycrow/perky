import {getSporeValue} from './spore_effects.js'
import {SPORE_DEFINITIONS} from './spores/index.js'


const MORALE_STATS = {
    approachWeight: 0.3,
    fleeWeight: -0.3,
    damage: 0.1
}


export function getEffectiveStat (entity, stat, base) {
    const spore = getSporeValue(entity, stat, base)
    const buff = entity.getBuffModifier?.(stat) ?? 1
    const swarm = entity.swarm?.getBuffModifier?.(stat) ?? 1
    const morale = getMoraleModifier(entity, stat)
    return spore * buff * swarm * morale
}


function getMoraleModifier (entity, stat) {
    const strength = MORALE_STATS[stat]

    if (!strength || !entity.swarm) {
        return 1
    }

    const morale = entity.swarm.morale ?? 50
    return 1 + (morale - 50) / 100 * strength
}


export function applyLeash (entity) {
    if (!entity.swarm) {
        return
    }

    const center = entity.swarm.getCenter()

    if (!center || center === entity.position) {
        return
    }

    const dx = entity.x - center.x
    const dy = entity.y - center.y
    const dist = Math.sqrt(dx * dx + dy * dy)
    const radius = entity.swarm.leashRadius

    if (dist > radius * 0.6) {
        const urgency = Math.min((dist - radius * 0.6) / (radius * 0.4), 1)
        entity.seek(center, urgency * 1.5)
    }
}


export function applySporeFrame (entity) {
    if (!entity.spores) {
        return
    }

    for (const key in entity.spores) {
        if (entity.spores[key] <= 0) {
            continue
        }

        SPORE_DEFINITIONS[key]?.onEveryFrame?.(entity)
    }
}


export function applyMovement (entity, deltaTime) {
    if (entity.direction?.length() > 0) {
        const accel = entity.direction.clone().multiplyScalar(entity.acceleration * deltaTime)
        entity.velocity.add(accel)
    } else {
        entity.dampenVelocity(0.01, deltaTime)
    }
}
