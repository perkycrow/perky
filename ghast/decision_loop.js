import {getSporeValue} from './spore_effects.js'


const DECISION_INTERVAL = 1

const OFFENSIVE_SPORES = ['anger', 'arrogance', 'naive']
const DEFENSIVE_SPORES = ['fear', 'sadness']


export default function updateDecisions (world, deltaTime) {
    world._decisionTimer = (world._decisionTimer || 0) + deltaTime

    if (world._decisionTimer < DECISION_INTERVAL) {
        return
    }

    world._decisionTimer -= DECISION_INTERVAL

    for (const entity of world.entities) {
        if (!entity.faction || entity.dying) {
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
    }

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


function findTarget (world, entity) {
    const range = getSporeValue(entity, 'detectRange', entity.baseDetectRange || 1)

    return world.nearest(entity, range, e => e.faction && e.faction !== entity.faction && !e.dying)
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


function updateCombativeness (world) {
    for (const battle of world.battles) {
        for (const swarm of battle.swarms) {
            updateSwarmCombativeness(swarm, battle)
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

    const raw = numRatio * 0.4 + momentum * 0.3 + sporeScore * 0.3
    swarm.combativeness += (raw * 0.5 + 0.5 - swarm.combativeness) * 0.3

    swarm.recentKills *= 0.7
    swarm.recentLosses *= 0.7
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
