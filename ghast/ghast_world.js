import World from '../game/world.js'
import Swarm from './swarm.js'
import Shade from './entities/shade.js'
import Skeleton from './entities/skeleton.js'
import Rat from './entities/rat.js'
import Inquisitor from './entities/inquisitor.js'
import Cage from './entities/cage.js'
import Turret from './entities/turret.js'
import Jar from './entities/jar.js'
import Projectile from './entities/projectile.js'


export default class GhastWorld extends World {

    constructor (options = {}) {
        super(options)

        this.paused = true
        this.swarms = []
        this.firstBlood = false

        this.on('hit', ({target, source}) => {
            this.#applyHit(target, source)
        })
    }


    togglePause () {
        this.paused = !this.paused
        return this.paused
    }


    update (deltaTime, context) {
        if (!this.started || this.paused) {
            return
        }

        this.preUpdate(deltaTime, context)

        for (const entity of this.entities) {
            if (entity.started && !entity.dying) {
                entity.update(deltaTime)
            }
        }

        this.postUpdate(deltaTime, context)
    }


    preUpdate () {
        for (const entity of this.entities) {
            if (!entity.team || entity.dying) {
                continue
            }

            this.#checkSurrounded(entity)
            this.#checkIsolated(entity)
        }

        this.#checkOutnumbered()
    }


    postUpdate (deltaTime) {
        this.#checkProjectileHits()
        this.#updateDying(deltaTime)
        this.#cleanupSwarms()
        this.#cleanup()
    }


    #checkProjectileHits () {
        for (const entity of this.entities) {
            if (!(entity instanceof Projectile) || !entity.alive) {
                continue
            }

            const hit = this.checkHit(entity, e => {
                if (e instanceof Projectile) {
                    return false
                }
                if (!e.team || e.team === entity.team) {
                    return false
                }
                if (e === entity.source) {
                    return false
                }
                return e.hitRadius > 0
            })

            if (hit) {
                entity.alive = false
                this.emit('hit', {source: entity.source, target: hit, projectile: entity})
            }
        }
    }


    #applyHit (target, source) {
        if (!target.damage) {
            return
        }

        const dealt = target.damage(1, {invincibility: 0.3})

        if (!dealt) {
            return
        }

        if (!this.firstBlood) {
            this.firstBlood = true
            this.emit('first_blood', {source, target})
        }

        if (source && target.velocity) {
            const knockDir = target.position.clone().sub(source.position)
            const len = knockDir.length()

            if (len > 0.01) {
                knockDir.multiplyScalar(5 / len)
                target.velocity.add(knockDir)
            }
        }

        if (target.isAlive() && target.hp <= target.maxHp * 0.3 && !target._lowHp) {
            target._lowHp = true
            this.emit('low_hp', {entity: target, source})
        }

        if (!target.isAlive()) {
            target.dying = 0.3
            target.hitRadius = 0
            this.#emitDeathEvents(target, source)
        }
    }


    #emitDeathEvents (victim, killer) {
        if (killer) {
            this.emit('kill', {killer, victim})
        }

        if (victim.swarm) {
            const wasLeader = victim.swarm.leader === victim

            for (const member of victim.swarm.members) {
                if (member !== victim && !member.dying) {
                    member.emit('ally_died', {ally: victim, killer})
                }
            }

            this.emit('ally_died', {entity: victim, swarm: victim.swarm, killer})

            if (wasLeader) {
                this.emit('leader_died', {entity: victim, swarm: victim.swarm, killer})
            }
        }
    }


    #checkSurrounded (entity) {
        const enemies = this.entitiesInRange(entity, 2, e => e.team && e.team !== entity.team && !e.dying)
        const wasSurrounded = entity._surrounded || false
        entity._surrounded = enemies.length >= 3

        if (entity._surrounded && !wasSurrounded) {
            this.emit('surrounded', {entity, enemies})
        }
    }


    #checkIsolated (entity) {
        if (!entity.swarm || entity.swarm.members.length <= 1) {
            entity._isolated = false
            return
        }

        const center = entity.swarm.getCenter()

        if (!center) {
            entity._isolated = false
            return
        }

        const dist = entity.position.distanceTo(center)
        const wasIsolated = entity._isolated || false
        entity._isolated = dist > entity.swarm.leashRadius * 1.5

        if (entity._isolated && !wasIsolated) {
            this.emit('isolated', {entity, swarm: entity.swarm})
        }
    }


    #checkOutnumbered () {
        for (const swarm of this.swarms) {
            const alive = swarm.members.filter(m => !m.dying)

            if (alive.length === 0) {
                swarm._outnumbered = false
                continue
            }

            let enemyCount = 0

            for (const other of this.swarms) {
                if (other.team !== swarm.team) {
                    enemyCount += other.members.filter(m => !m.dying).length
                }
            }

            const wasOutnumbered = swarm._outnumbered || false
            swarm._outnumbered = enemyCount > alive.length * 1.5

            if (swarm._outnumbered && !wasOutnumbered) {
                this.emit('outnumbered', {swarm, allyCount: alive.length, enemyCount})
            }
        }
    }


    #updateDying (deltaTime) {
        for (const entity of this.entities) {
            if (entity.dying > 0) {
                entity.dying -= deltaTime

                if (entity.dying <= 0) {
                    entity.alive = false
                }
            }
        }
    }


    #cleanup () {
        for (const entity of this.entities) {
            if (entity.alive === false) {
                this.removeChild(entity.$id)
            }
        }
    }


    createSwarm (team) {
        const swarm = new Swarm(team)
        this.swarms.push(swarm)
        return swarm
    }


    #cleanupSwarms () {
        for (const swarm of this.swarms) {
            swarm.cleanup()
        }
    }


    spawnShade (options = {}) {
        const entity = this.create(Shade, {
            x: options.x || 0,
            y: options.y || 0
        })
        entity.team = options.team || null
        this.#assignSwarm(entity, options.swarm)
        return entity
    }


    spawnSkeleton (options = {}) {
        const entity = this.create(Skeleton, {
            x: options.x || 0,
            y: options.y || 0
        })
        entity.team = options.team || null
        this.#assignSwarm(entity, options.swarm)
        return entity
    }


    spawnRat (options = {}) {
        const entity = this.create(Rat, {
            x: options.x || 0,
            y: options.y || 0
        })
        entity.team = options.team || null
        this.#assignSwarm(entity, options.swarm)
        return entity
    }


    spawnInquisitor (options = {}) {
        const entity = this.create(Inquisitor, {
            x: options.x || 0,
            y: options.y || 0
        })
        entity.team = options.team || null
        this.#assignSwarm(entity, options.swarm)
        return entity
    }


    #assignSwarm (entity, swarm) {
        if (swarm) {
            entity.swarm = swarm
            swarm.add(entity)
        }
    }


    spawnCage (options = {}) {
        return this.create(Cage, {
            x: options.x || 0,
            y: options.y || 0
        })
    }


    spawnTurret (options = {}) {
        return this.create(Turret, {
            x: options.x || 0,
            y: options.y || 0
        })
    }


    spawnJar (options = {}) {
        return this.create(Jar, {
            x: options.x || 0,
            y: options.y || 0
        })
    }


    spawnProjectile (options = {}) {
        return this.create(Projectile, {
            x: options.x || 0,
            y: options.y || 0,
            dirX: options.dirX || 0,
            dirY: options.dirY || 0,
            speed: options.speed || 6,
            team: options.team || null,
            source: options.source || null,
            ttl: options.ttl || 3
        })
    }

}
