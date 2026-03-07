import {getSporeValue} from './spore_effects.js'


const DECISION_INTERVAL = 1


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
            continue
        }

        entity.target = findTarget(world, entity)
    }
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
