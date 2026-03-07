const FLEE_RADIUS = 8
const FLEE_DELAY = 2


export default class Battle {

    #fleeTimers = new Map()
    #totalAdded = 0

    constructor () {
        this.swarms = []
        this.firstBlood = false
        this.resolved = false
    }


    addSwarm (swarm) {
        if (this.hasSwarm(swarm)) {
            return
        }

        this.swarms.push(swarm)
        this.#fleeTimers.set(swarm, 0)
        this.#totalAdded++
    }


    removeSwarm (swarm) {
        const index = this.swarms.indexOf(swarm)

        if (index !== -1) {
            this.swarms.splice(index, 1)
            this.#fleeTimers.delete(swarm)
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
        return this.#totalAdded >= 2 && this.aliveFactions().size <= 1
    }


    update (deltaTime, world) {
        this.#checkFlee(deltaTime, world)
    }


    #fleeVerdict (fleeingSwarm) {
        let totalScore = 0
        let count = 0

        for (const swarm of this.swarms) {
            if (swarm === fleeingSwarm) {
                continue
            }

            totalScore += swarm.combativeness || 0.5
            count++
        }

        const avgRemaining = count > 0 ? totalScore / count : 0.5
        const diff = avgRemaining - (fleeingSwarm.combativeness || 0.5)

        if (diff > 0.15) {
            return 'fled'
        }

        if (diff < -0.15) {
            return 'routed'
        }

        return 'disengage'
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
                const timer = (this.#fleeTimers.get(swarm) || 0) + deltaTime

                if (timer >= FLEE_DELAY) {
                    const verdict = this.#fleeVerdict(swarm)
                    this.removeSwarm(swarm)
                    world.emit('battle_fled', {battle: this, swarm, verdict})
                } else {
                    this.#fleeTimers.set(swarm, timer)
                }
            } else {
                this.#fleeTimers.set(swarm, 0)
            }
        }
    }

}
