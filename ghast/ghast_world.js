import World from '../game/world.js'
import Shade from './entities/shade.js'
import Skeleton from './entities/skeleton.js'
import Rat from './entities/rat.js'
import Inquisitor from './entities/inquisitor.js'
import Soul from './entities/soul.js'
import Cage from './entities/cage.js'
import Turret from './entities/turret.js'
import Jar from './entities/jar.js'
import Projectile from './entities/projectile.js'


export default class GhastWorld extends World {

    constructor (options = {}) {
        super(options)

        this.on('hit', ({target, source}) => {
            this.#applyHit(target, source)
        })
    }


    preUpdate (deltaTime, context) {
        const direction = context.getDirection('move')
        if (this.shade) {
            this.shade.move(direction)
        }
    }


    postUpdate () {
        this.#checkProjectileHits()
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

        if (source && target.velocity) {
            const knockDir = target.position.clone().sub(source.position)
            const len = knockDir.length()

            if (len > 0.01) {
                knockDir.multiplyScalar(5 / len)
                target.velocity.add(knockDir)
            }
        }

        if (!target.isAlive()) {
            target.alive = false
        }
    }


    #cleanup () {
        for (const entity of this.entities) {
            if (entity.alive === false) {
                this.removeChild(entity.$id)
            }
        }
    }


    spawnShade (options = {}) {
        const entity = this.create(Shade, {
            $id: 'shade',
            $bind: 'shade',
            x: options.x || 0,
            y: options.y || 0
        })
        entity.team = options.team || null
        return entity
    }


    spawnSkeleton (options = {}) {
        const entity = this.create(Skeleton, {
            x: options.x || 0,
            y: options.y || 0
        })
        entity.team = options.team || null
        return entity
    }


    spawnRat (options = {}) {
        const entity = this.create(Rat, {
            x: options.x || 0,
            y: options.y || 0
        })
        entity.team = options.team || null
        return entity
    }


    spawnInquisitor (options = {}) {
        const entity = this.create(Inquisitor, {
            x: options.x || 0,
            y: options.y || 0
        })
        entity.team = options.team || null
        return entity
    }


    spawnSoul (options = {}) {
        const entity = this.create(Soul, {
            x: options.x || 0,
            y: options.y || 0
        })
        entity.team = options.team || null
        return entity
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
