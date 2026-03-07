const FLEE_RADIUS = 8
const FLEE_DELAY = 2


export default class Battle {

    constructor () {
        this.swarms = []
        this.firstBlood = false
        this.resolved = false
        this._fleeTimers = new Map()
        this._totalAdded = 0
    }


    addSwarm (swarm) {
        if (this.hasSwarm(swarm)) {
            return
        }

        this.swarms.push(swarm)
        this._fleeTimers.set(swarm, 0)
        this._totalAdded++
    }


    removeSwarm (swarm) {
        const index = this.swarms.indexOf(swarm)

        if (index !== -1) {
            this.swarms.splice(index, 1)
            this._fleeTimers.delete(swarm)
        }
    }


    hasSwarm (swarm) {
        return this.swarms.includes(swarm)
    }


    getCenter () {
        let cx = 0
        let cy = 0
        let count = 0

        for (const swarm of this.swarms) {
            for (const member of swarm.members) {
                if (member.dying || member.alive === false) {
                    continue
                }

                cx += member.x
                cy += member.y
                count++
            }
        }

        if (count === 0) {
            return null
        }

        return {x: cx / count, y: cy / count}
    }


    aliveFactions () {
        const factions = new Set()

        for (const swarm of this.swarms) {
            for (const member of swarm.members) {
                if (!member.dying && member.alive !== false) {
                    factions.add(swarm.faction)
                    break
                }
            }
        }

        return factions
    }


    isOver () {
        return this._totalAdded >= 2 && this.aliveFactions().size <= 1
    }


    update (deltaTime, world) {
        this.#checkFlee(deltaTime, world)
    }


    #checkFlee (deltaTime, world) {
        const center = this.getCenter()

        if (!center) {
            return
        }

        for (const swarm of [...this.swarms]) {
            const allOutside = swarm.members.every(member => {
                if (member.dying || member.alive === false) {
                    return true
                }

                const dx = member.x - center.x
                const dy = member.y - center.y
                return Math.sqrt(dx * dx + dy * dy) > FLEE_RADIUS
            })

            const hasAlive = swarm.members.some(m => !m.dying && m.alive !== false)

            if (allOutside && hasAlive) {
                const timer = (this._fleeTimers.get(swarm) || 0) + deltaTime

                if (timer >= FLEE_DELAY) {
                    this.removeSwarm(swarm)
                    world.emit('battle_fled', {battle: this, swarm})
                } else {
                    this._fleeTimers.set(swarm, timer)
                }
            } else {
                this._fleeTimers.set(swarm, 0)
            }
        }
    }

}
