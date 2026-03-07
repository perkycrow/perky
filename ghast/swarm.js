export default class Swarm {

    constructor (team) {
        this.team = team
        this.members = []
        this.leader = null
        this.leashRadius = 3
        this.buffs = new Map()
    }


    add (entity) {
        if (this.members.includes(entity)) {
            return
        }

        this.members.push(entity)
        this.electLeader()
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


    electLeader () {
        let best = null

        for (const member of this.members) {
            if (member.dying || member.alive === false) {
                continue
            }

            if (!best || member.rank > best.rank) {
                best = member
            }
        }

        this.leader = best
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
