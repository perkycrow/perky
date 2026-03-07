export default class Swarm {

    constructor (team) {
        this.team = team
        this.members = []
        this.leader = null
        this.leashRadius = 3
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
