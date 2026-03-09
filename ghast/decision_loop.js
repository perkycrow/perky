import {getSporeValue} from './spore_effects.js'
import {DECAY_RATE} from './spores.js'
import {SPORE_LIST, SPORE_DEFINITIONS} from './spores/index.js'


const DECISION_INTERVAL = 0.5

const OFFENSIVE_SPORES = SPORE_LIST.filter(s => s.inclination === 'offensive').map(s => s.key)
const DEFENSIVE_SPORES = SPORE_LIST.filter(s => s.inclination === 'defensive').map(s => s.key)


export default function updateDecisions (world, deltaTime) {
    world._decisionTimer = (world._decisionTimer || 0) + deltaTime

    if (world._decisionTimer < DECISION_INTERVAL) {
        return
    }

    world._decisionTimer -= DECISION_INTERVAL

    for (const entity of world.entities) {
        if (!entity.faction || entity.dying || entity.rank === undefined) {
            continue
        }

        if (isTargetValid(entity)) {
            entity._battleCenter = null
            continue
        }

        entity.target = findTarget(world, entity)

        if (entity.target) {
            entity._battleCenter = null
        } else {
            entity._battleCenter = findBattleCenter(world, entity)
        }

        applySporeDecisions(entity, world)
    }

    updateThreat(world)
    updateSporeDecay(world)
    updateCombativeness(world)
}


function isTargetValid (entity) {
    const target = entity.target

    if (!target || target.dying || target.alive === false) {
        return false
    }

    const range = getSporeValue(entity, 'detectRange', entity.baseDetectRange || 1)
    const distSq = entity.position.distanceToSquared(target.position)

    return distSq < range * range
}


function isValidTarget (entity, other) {
    return other !== entity
        && other.faction
        && other.faction !== entity.faction
        && !other.dying
        && other.rank !== undefined
}


function findTarget (world, entity) {
    const range = getSporeValue(entity, 'detectRange', entity.baseDetectRange || 1)
    const rangeSq = range * range
    let best = null
    let bestScore = 0

    for (const other of world.entities) {
        if (!isValidTarget(entity, other)) {
            continue
        }

        const distSq = entity.position.distanceToSquared(other.position)

        if (distSq >= rangeSq) {
            continue
        }

        const score = computeThreat(entity, other, distSq)

        if (score > bestScore) {
            bestScore = score
            best = other
        }
    }

    return best
}


const RPS_BONUS = {
    Skeleton: 'Rat',
    Rat: 'Inquisitor',
    Inquisitor: 'Skeleton'
}


function computeThreat (attacker, target, distSq) {
    const proximity = 1 / (1 + distSq)
    const rpsFactor = getRpsBonus(attacker, target)
    const targetAggro = 1 + (target.spores?.naive || 0) * 0.2

    let score = proximity * rpsFactor * targetAggro

    if (attacker.spores) {
        for (const key in attacker.spores) {
            if (attacker.spores[key] <= 0) {
                continue
            }

            const hook = SPORE_DEFINITIONS[key]?.scoreTarget

            if (hook) {
                score *= hook(attacker, target)
            }
        }
    }

    return score
}


function getRpsBonus (attacker, target) {
    const preferred = RPS_BONUS[attacker.constructor.name]

    if (preferred === target.constructor.name) {
        return 1.5
    }

    return 1
}


function findBattleCenter (world, entity) {
    if (!entity.swarm) {
        return null
    }

    const battle = world.battles.find(b => b.hasSwarm(entity.swarm))

    if (!battle) {
        return null
    }

    return battle.getCenter()
}


function updateThreat (world) {
    for (const entity of world.entities) {
        if (entity.rank === undefined || entity.dying) {
            continue
        }

        entity._threat = 0
        entity._threatCount = 0
    }

    for (const entity of world.entities) {
        if (!entity.target || entity.dying || entity.rank === undefined) {
            continue
        }

        const target = entity.target

        if (target._threat === undefined) {
            continue
        }

        const distSq = entity.position.distanceToSquared(target.position)
        const proximity = 1 / (1 + distSq)
        target._threat += (entity.rank || 1) * proximity
        target._threatCount++
    }
}


function updateSporeDecay (world) {
    for (const entity of world.entities) {
        if (!entity.spores || entity.dying) {
            continue
        }

        for (const key in entity.spores) {
            if (entity.spores[key] <= 0) {
                continue
            }

            if (entity.imprint) {
                entity.imprint[key] += entity.spores[key]
            }

            entity.spores[key] = Math.max(0, entity.spores[key] - DECAY_RATE)
        }
    }
}


function updateCombativeness (world) {
    const updated = new Set()

    for (const battle of world.battles) {
        for (const swarm of battle.swarms) {
            updateSwarmCombativeness(swarm, battle)
            updated.add(swarm)
        }
    }

    for (const swarm of world.swarms) {
        updateSwarmMorale(swarm)

        if (!updated.has(swarm)) {
            swarm.recentKills *= 0.7
            swarm.recentLosses *= 0.7
        }
    }
}


function updateSwarmCombativeness (swarm, battle) {
    const alive = swarm.members.filter(m => !m.dying).length
    let enemyCount = 0

    for (const other of battle.swarms) {
        if (other.faction !== swarm.faction) {
            enemyCount += other.members.filter(m => !m.dying).length
        }
    }

    const total = alive + enemyCount
    const numRatio = total > 0 ? (alive - enemyCount) / total : 0

    const momentum = Math.max(-1, Math.min(1,
        (swarm.recentKills - swarm.recentLosses) * 0.3))

    const sporeScore = getSwarmSporeInclination(swarm)
    const moraleFactor = (swarm.morale - 50) / 100

    const raw = numRatio * 0.3 + momentum * 0.25 + sporeScore * 0.25 + moraleFactor * 0.2
    swarm.combativeness += (raw * 0.5 + 0.5 - swarm.combativeness) * 0.3

    swarm.recentKills *= 0.7
    swarm.recentLosses *= 0.7
}


function applySporeDecisions (entity, world) {
    if (!entity.spores) {
        return
    }

    for (const key in entity.spores) {
        if (entity.spores[key] <= 0) {
            continue
        }

        SPORE_DEFINITIONS[key]?.onDecisionFrame?.(entity, world)
    }
}


function updateSwarmMorale (swarm) {
    for (const spore of SPORE_LIST) {
        if (!spore.morale) {
            continue
        }

        let count = 0

        for (const member of swarm.members) {
            if (member.dying || !member.spores) {
                continue
            }

            count += member.spores[spore.key] || 0
        }

        if (count > 0) {
            swarm.adjustMorale(spore.morale * count)
        }
    }

}


function getSwarmSporeInclination (swarm) {
    let offensive = 0
    let defensive = 0

    for (const member of swarm.members) {
        if (member.dying || !member.spores) {
            continue
        }

        for (const key of OFFENSIVE_SPORES) {
            offensive += member.spores[key] || 0
        }

        for (const key of DEFENSIVE_SPORES) {
            defensive += member.spores[key] || 0
        }
    }

    const total = offensive + defensive

    if (total === 0) {
        return 0
    }

    return (offensive - defensive) / total
}
