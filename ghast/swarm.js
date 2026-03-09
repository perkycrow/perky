import {TYPE_PRIORITY} from './rank.js'


export default class Swarm {

    constructor (faction) {
        this.faction = faction
        this.members = []
        this.leader = null
        this.leashRadius = 5
        this.shards = 0
        this.xp = 0
        this.morale = 50
        this.combativeness = 0.5
        this.recentKills = 0
        this.recentLosses = 0
        this.buffs = new Map()
    }


    get capacity () {
        return this.leader?.rank || 0
    }


    get isOverCapacity () {
        return this.members.length > this.capacity
    }


    add (entity) {
        if (this.members.includes(entity)) {
            return false
        }

        if (this.leader && this.members.length >= this.capacity) {
            return false
        }

        this.members.push(entity)
        this.electLeader()
        return true
    }


    remove (entity) {
        const index = this.members.indexOf(entity)

        if (index !== -1) {
            this.members.splice(index, 1)
            this.electLeader()
        }
    }


    getCenter () {
        if (!this.leader) {
            return null
        }

        return this.leader.position
    }


    addShards (amount) {
        this.shards += amount
    }


    spendShards (amount) {
        if (this.shards < amount) {
            return false
        }

        this.shards -= amount
        return true
    }


    electLeader () {
        let best = null

        for (const member of this.members) {
            if (member.dying || member.alive === false) {
                continue
            }

            if (!best || comparePriority(member, best) > 0) {
                best = member
            }
        }

        this.leader = best
    }


    addXp (amount) {
        this.xp += amount
    }


    adjustMorale (amount) {
        this.morale = Math.max(0, Math.min(100, this.morale + amount))
    }


    applyBuff (key, duration, modifiers = {}) {
        const existing = this.buffs.get(key)

        if (existing) {
            existing.remaining = existing.duration
            existing.modifiers = modifiers
            return existing
        }

        const buff = {key, duration, remaining: duration, modifiers}
        this.buffs.set(key, buff)
        return buff
    }


    removeBuff (key) {
        return this.buffs.delete(key)
    }


    hasBuff (key) {
        return this.buffs.has(key)
    }


    getBuffModifier (stat) {
        let result = 1

        for (const buff of this.buffs.values()) {
            if (stat in buff.modifiers) {
                result *= buff.modifiers[stat]
            }
        }

        return result
    }


    updateBuffs (deltaTime) {
        for (const [key, buff] of this.buffs) {
            if (buff.duration < 0) {
                continue
            }

            buff.remaining -= deltaTime

            if (buff.remaining <= 0) {
                this.buffs.delete(key)
            }
        }
    }


    cleanup () {
        let changed = false

        for (let i = this.members.length - 1; i >= 0; i--) {
            const member = this.members[i]

            if (member.alive === false || member.dying) {
                member.swarm = null
                this.members.splice(i, 1)
                changed = true
            }
        }

        if (changed) {
            this.electLeader()
        }
    }

}


function comparePriority (a, b) {
    if (a.rank !== b.rank) {
        return a.rank - b.rank
    }

    const xpA = a.getXp?.() ?? 0
    const xpB = b.getXp?.() ?? 0

    if (xpA !== xpB) {
        return xpA - xpB
    }

    const typeA = TYPE_PRIORITY[a.constructor.name] || 0
    const typeB = TYPE_PRIORITY[b.constructor.name] || 0

    return typeA - typeB
}
