import {test, expect} from 'vitest'
import {
    getPromotionCost,
    getRankModifier,
    canPromote,
    promote,
    MAX_RANK,
    PROMOTION_COSTS,
    TYPE_PRIORITY
} from './rank.js'


test('getPromotionCost', () => {
    expect(getPromotionCost(1)).toBe(2)
    expect(getPromotionCost(2)).toBe(4)
    expect(getPromotionCost(3)).toBe(8)
    expect(getPromotionCost(4)).toBe(16)
    expect(getPromotionCost(5)).toBe(32)
    expect(getPromotionCost(6)).toBe(64)
})


test('getPromotionCost invalid rank', () => {
    expect(getPromotionCost(0)).toBe(Infinity)
    expect(getPromotionCost(7)).toBe(Infinity)
    expect(getPromotionCost(-1)).toBe(Infinity)
})


test('getRankModifier rank 1', () => {
    expect(getRankModifier(1, 'hp')).toBe(1)
    expect(getRankModifier(1, 'damage')).toBe(1)
    expect(getRankModifier(1, 'speed')).toBe(1)
    expect(getRankModifier(1, 'cooldown')).toBe(1)
})


test('getRankModifier higher ranks scale up', () => {
    expect(getRankModifier(3, 'hp')).toBeGreaterThan(1)
    expect(getRankModifier(3, 'damage')).toBeGreaterThan(1)
    expect(getRankModifier(3, 'speed')).toBeGreaterThan(1)
    expect(getRankModifier(3, 'cooldown')).toBeLessThan(1)
})


test('getRankModifier rank 7 values', () => {
    const hp = getRankModifier(7, 'hp')
    const damage = getRankModifier(7, 'damage')
    const speed = getRankModifier(7, 'speed')
    const cooldown = getRankModifier(7, 'cooldown')

    expect(hp).toBeGreaterThan(1.5)
    expect(hp).toBeLessThan(2.5)
    expect(damage).toBeGreaterThan(1.2)
    expect(damage).toBeLessThan(1.8)
    expect(speed).toBeGreaterThan(1.05)
    expect(speed).toBeLessThan(1.25)
    expect(cooldown).toBeGreaterThan(0.7)
    expect(cooldown).toBeLessThan(0.95)
})


test('getRankModifier unknown stat', () => {
    expect(getRankModifier(5, 'unknown')).toBe(1)
})


test('getRankModifier monotonically increasing for hp', () => {
    for (let r = 2; r <= 7; r++) {
        expect(getRankModifier(r, 'hp')).toBeGreaterThan(getRankModifier(r - 1, 'hp'))
    }
})


test('canPromote', () => {
    const swarm = {shards: 10}
    const entity = {rank: 1, swarm}

    expect(canPromote(entity)).toBe(true)
})


test('canPromote not enough shards', () => {
    const swarm = {shards: 1}
    const entity = {rank: 1, swarm}

    expect(canPromote(entity)).toBe(false)
})


test('canPromote max rank', () => {
    const swarm = {shards: 999}
    const entity = {rank: MAX_RANK, swarm}

    expect(canPromote(entity)).toBe(false)
})


test('canPromote no swarm', () => {
    expect(canPromote({rank: 1})).toBe(false)
    expect(canPromote(null)).toBe(false)
})


test('promote', () => {
    const events = []
    const swarm = {
        shards: 10,
        spendShards (amount) { this.shards -= amount }
    }
    const host = {emit: (name, data) => events.push({name, data})}
    const entity = {rank: 1, swarm, host}

    const result = promote(entity)

    expect(result).toBe(true)
    expect(entity.rank).toBe(2)
    expect(swarm.shards).toBe(8)
    expect(events.length).toBe(1)
    expect(events[0].name).toBe('rank_up')
    expect(events[0].data.oldRank).toBe(1)
    expect(events[0].data.newRank).toBe(2)
})


test('promote fails when cannot promote', () => {
    const swarm = {shards: 0, spendShards () {}}
    const entity = {rank: 1, swarm}

    expect(promote(entity)).toBe(false)
    expect(entity.rank).toBe(1)
})


test('PROMOTION_COSTS doubles each rank', () => {
    for (let i = 2; i < PROMOTION_COSTS.length; i++) {
        expect(PROMOTION_COSTS[i]).toBe(PROMOTION_COSTS[i - 1] * 2)
    }
})


test('TYPE_PRIORITY ordering', () => {
    expect(TYPE_PRIORITY.Shade).toBeGreaterThan(TYPE_PRIORITY.Inquisitor)
    expect(TYPE_PRIORITY.Inquisitor).toBeGreaterThan(TYPE_PRIORITY.Skeleton)
    expect(TYPE_PRIORITY.Skeleton).toBeGreaterThan(TYPE_PRIORITY.Rat)
})
