import {getSporeValue} from './spore_effects.js'
import {SPORE_DEFINITIONS} from './spores/index.js'
import {getRankModifier} from './rank.js'


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


export function getMoraleModifier (entity, stat) {
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
    const hasTarget = entity.target && !entity.target.dying

    if (hasTarget) {
        const hardRadius = radius * 2

        if (dist > hardRadius) {
            entity.target = null
            entity.seek(center, 2)
        }
    } else if (dist > radius * 0.6) {
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


export function getCooldownModifier (entity) {
    return getEffectiveStat(entity, 'cooldown', 1)
}


export function applyFlankForce (entity, target, weight = 0.8) {
    const host = entity.host

    if (!host) {
        return
    }

    const perp = computePerpendicularToTarget(entity, target)

    if (!perp) {
        return
    }

    const lateralSum = computeLateralSum(entity, perp)

    if (lateralSum === null) {
        return
    }

    const side = lateralSum >= 0 ? 1 : -1
    entity.addForce({x: perp.x * side, y: perp.y * side}, weight)
}


function computePerpendicularToTarget (entity, target) {
    const toTargetX = target.x - entity.x
    const toTargetY = target.y - entity.y
    const toTargetLen = Math.sqrt(toTargetX * toTargetX + toTargetY * toTargetY)

    if (toTargetLen < 0.01) {
        return null
    }

    const dirX = toTargetX / toTargetLen
    const dirY = toTargetY / toTargetLen

    return {x: -dirY, y: dirX}
}


function computeLateralSum (entity, perp) {
    const allies = entity.host?.space?.entitiesInRange(entity, 2) ?? []
    let lateralSum = 0
    let count = 0

    for (const ally of allies) {
        if (ally === entity || ally.faction !== entity.faction) {
            continue
        }

        if (ally.target !== entity.target) {
            continue
        }

        const contribution = computeAllyLateralContribution(entity, ally, perp)
        lateralSum += contribution
        count++
    }

    if (count === 0) {
        return null
    }

    return lateralSum
}


function computeAllyLateralContribution (entity, ally, perp) {
    const dx = entity.x - ally.x
    const dy = entity.y - ally.y
    const distSq = dx * dx + dy * dy

    if (distSq < 0.01) {
        return (Math.random() - 0.5) * 2
    }

    const dist = Math.sqrt(distSq)
    const lateral = (dx * perp.x + dy * perp.y) / dist
    const proximity = 1 / dist

    return (lateral >= 0 ? 1 : -1) * proximity
}


export function getMaxSpeed (entity) {
    const baseSpeed = entity.maxSpeed * (getRankModifier(entity.rank || 1, 'speed') || 1)
    const effective = getEffectiveStat(entity, 'speed', baseSpeed) * getStaminaSpeedModifier(entity)
    const inCombat = entity.target || entity._battleCenter

    if (!inCombat && entity.swarm) {
        return Math.min(effective, entity.swarm.marchSpeed)
    }

    return effective
}


export function applyMovement (entity, deltaTime) {
    entity.dampenVelocity(0.88, deltaTime)

    if (entity.direction?.length() > 0) {
        const accel = entity.direction.clone().multiplyScalar(entity.acceleration * deltaTime)
        entity.velocity.add(accel)
    }
}


const STAMINA_DRAIN = 8
const STAMINA_REGEN = 12
const STAMINA_THRESHOLD = 0.3


export function updateStamina (entity, deltaTime) {
    if (entity.stamina === undefined) {
        return
    }

    const inCombat = entity.target && !entity.target.dying
    const speed = entity.velocity?.length() ?? 0
    const maxSpeed = entity.maxSpeed || 1
    const effort = speed / maxSpeed

    if (inCombat && effort > 0.3) {
        entity.stamina -= STAMINA_DRAIN * effort * deltaTime
    } else {
        entity.stamina += STAMINA_REGEN * deltaTime
    }

    entity.stamina = Math.max(0, Math.min(entity.maxStamina, entity.stamina))
}


export function updateMelee (entity, deltaTime, {separateRange = 1.5, separateWeight = 1} = {}) {
    updateStamina(entity, deltaTime)
    entity.updateHealth(deltaTime)
    entity.updateMeleeAttack(deltaTime)

    if (updateDashPhase(entity, deltaTime)) {
        return
    }

    if (updateAttackPhase(entity, deltaTime)) {
        return
    }

    updateCombatBehavior(entity)
    applySporeFrame(entity)
    entity.wander(getEffectiveStat(entity, 'wanderWeight', 0.3))

    const neighbors = entity.host?.space?.entitiesInRange(entity, separateRange) ?? []
    entity.separate(neighbors, separateWeight)

    applyLeash(entity)
    entity.move(entity.resolveForce())
    applyMovement(entity, deltaTime)
    entity.clampVelocity(getMaxSpeed(entity))
    entity.applyVelocity(deltaTime)
}


function updateDashPhase (entity, deltaTime) {
    if (!entity.updateDash) {
        return false
    }

    entity.updateDash(deltaTime)

    if (!entity.isDashing()) {
        return false
    }

    entity.clampVelocity(entity.maxSpeed * (entity.dashMultiplier || 4))
    entity.applyVelocity(deltaTime)
    return true
}


function updateAttackPhase (entity, deltaTime) {
    if (!entity.isAttacking()) {
        return false
    }

    entity.dampenVelocity(0.001, deltaTime)
    entity.applyVelocity(deltaTime)
    return true
}


function updateCombatBehavior (entity) {
    const enemy = entity.target

    if (enemy) {
        entity.seek(enemy.position, getEffectiveStat(entity, 'approachWeight', 1))
        applyFlankForce(entity, enemy)
        entity.meleeAttack(enemy)
    } else if (entity._battleCenter) {
        entity.seek(entity._battleCenter, 0.3)
    }
}


export function getStaminaSpeedModifier (entity) {
    if (entity.stamina === undefined) {
        return 1
    }

    const ratio = entity.stamina / entity.maxStamina

    if (ratio > STAMINA_THRESHOLD) {
        return 1
    }

    return 0.4 + 0.6 * (ratio / STAMINA_THRESHOLD)
}
