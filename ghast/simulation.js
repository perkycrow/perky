import GhastWorld from './ghast_world.js'


const DT = 1 / 60
const MAX_DURATION = 120

const SPAWN_FN = {
    Shade: 'spawnShade',
    Skeleton: 'spawnSkeleton',
    Rat: 'spawnRat',
    Inquisitor: 'spawnInquisitor'
}


export default class Simulation {

    constructor (config = {}) {
        this.config = config
        this.maxDuration = config.maxDuration || MAX_DURATION
        this.runs = config.runs || 1
    }


    run () {
        const results = []

        for (let i = 0; i < this.runs; i++) {
            results.push(this.#runOnce(i % 2 === 1))
        }

        return summarize(results)
    }


    #runOnce (reverseFactions = false) {
        const world = new GhastWorld()
        world.start()
        world.paused = false

        const factions = reverseFactions
            ? [...this.config.factions].reverse()
            : (this.config.factions || [])
        const swarms = []
        const log = {kills: [], battleResolved: null}

        for (const faction of factions) {
            const swarm = world.createSwarm(faction.name)
            swarms.push({name: faction.name, swarm})

            for (const unit of faction.units) {
                const fn = SPAWN_FN[unit.type]

                if (!fn) {
                    continue
                }

                const entity = world[fn]({
                    x: unit.x ?? faction.x ?? 0,
                    y: unit.y ?? faction.y ?? 0,
                    faction: faction.name,
                    swarm,
                    rank: unit.rank
                })

                applyUnitConfig(entity, unit)
            }
        }

        world.on('kill', ({killer, victim}) => {
            log.kills.push({
                killer: killer?.constructor.name,
                killerFaction: killer?.faction,
                victim: victim?.constructor.name,
                victimFaction: victim?.faction
            })
        })

        world.on('battle_resolved', ({winner}) => {
            log.battleResolved = winner
        })

        const maxFrames = Math.ceil(this.maxDuration / DT)
        let frame = 0

        for (frame = 0; frame < maxFrames; frame++) {
            world.update(DT)

            if (isFinished(world)) {
                break
            }
        }

        const duration = frame * DT
        const survivors = {}

        for (const {name, swarm} of swarms) {
            const alive = swarm.members.filter(m => !m.dying && m.alive !== false)
            survivors[name] = {
                count: alive.length,
                totalHp: alive.reduce((sum, m) => sum + (m.hp ?? 0), 0)
            }
        }

        const winner = findWinner(survivors, log.battleResolved)

        return {winner, duration, survivors, kills: log.kills}
    }

}


function applyUnitConfig (entity, unit) {
    if (unit.spores) {
        for (const key of unit.spores) {
            if (entity.spores[key] !== undefined) {
                entity.spores[key]++
            }
        }
    }

    if (unit.overrides) {
        for (const [key, value] of Object.entries(unit.overrides)) {
            entity[key] = value
        }
    }
}


function isFinished (world) {
    const aliveFactions = new Set()

    for (const entity of world.entities) {
        if (entity.faction && !entity.dying && entity.alive !== false && entity.rank !== undefined) {
            aliveFactions.add(entity.faction)
        }
    }

    return aliveFactions.size <= 1
}


function findWinner (survivors, battleWinner) {
    if (battleWinner) {
        return battleWinner
    }

    let best = null
    let bestCount = 0

    for (const [name, data] of Object.entries(survivors)) {
        if (data.count > bestCount) {
            bestCount = data.count
            best = name
        }
    }

    return best
}


function summarize (results) {
    const wins = {}
    let totalDuration = 0

    for (const result of results) {
        wins[result.winner] = (wins[result.winner] || 0) + 1
        totalDuration += result.duration
    }

    return {
        total: results.length,
        wins,
        avgDuration: totalDuration / results.length,
        results
    }
}


export function runMatchup (typeA, typeB, options = {}) {
    const {
        runs = 100,
        distance = 2,
        sporesA = [],
        sporesB = [],
        overridesA = null,
        overridesB = null,
        rankA,
        rankB,
        maxDuration = 30
    } = options

    const unitA = {type: typeA, spores: sporesA, rank: rankA}
    const unitB = {type: typeB, spores: sporesB, rank: rankB}

    if (overridesA) {
        unitA.overrides = overridesA
    }

    if (overridesB) {
        unitB.overrides = overridesB
    }

    const sim = new Simulation({
        runs,
        maxDuration,
        factions: [
            {
                name: 'alpha',
                x: -distance / 2,
                y: 0,
                units: [unitA]
            },
            {
                name: 'beta',
                x: distance / 2,
                y: 0,
                units: [unitB]
            }
        ]
    })

    const summary = sim.run()
    const winsA = summary.wins.alpha || 0
    const winsB = summary.wins.beta || 0

    return {
        typeA,
        typeB,
        winsA,
        winsB,
        winRateA: winsA / runs,
        winRateB: winsB / runs,
        avgDuration: summary.avgDuration,
        draws: runs - winsA - winsB
    }
}


export function runMatrix (types, options = {}) {
    const matrix = {}

    for (const a of types) {
        matrix[a] = {}

        for (const b of types) {
            if (a === b) {
                matrix[a][b] = null
                continue
            }

            matrix[a][b] = runMatchup(a, b, options)
        }
    }

    return matrix
}
