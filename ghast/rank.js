export const MAX_RANK = 7

export const PROMOTION_COSTS = [0, 2, 4, 8, 16, 32, 64]

export const RANK_SCALING = {
    hp: 0.35,
    damage: 0.2,
    speed: 0.06,
    cooldown: -0.08
}

export const TYPE_PRIORITY = {
    Shade: 4,
    Inquisitor: 3,
    Skeleton: 2,
    Rat: 1
}


export function getPromotionCost (rank) {
    if (rank < 1 || rank >= MAX_RANK) {
        return Infinity
    }

    return PROMOTION_COSTS[rank]
}


export function getRankModifier (rank, stat) {
    const exponent = RANK_SCALING[stat]

    if (exponent === undefined || rank <= 1) {
        return 1
    }

    return Math.pow(rank, exponent)
}


export function canPromote (entity) {
    if (!entity || !entity.swarm) {
        return false
    }

    if (entity.rank >= MAX_RANK) {
        return false
    }

    const cost = getPromotionCost(entity.rank)
    return entity.swarm.shards >= cost
}


export function promote (entity) {
    if (!canPromote(entity)) {
        return false
    }

    const cost = getPromotionCost(entity.rank)
    entity.swarm.spendShards(cost)

    const oldRank = entity.rank
    entity.rank = oldRank + 1

    entity.host?.emit('rank_up', {entity, oldRank, newRank: entity.rank})

    return true
}
