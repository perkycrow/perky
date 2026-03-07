import Entity from '../../game/entity.js'
import Velocity from '../../game/velocity.js'
import Steering from '../../game/steering.js'
import Health from '../../game/health.js'
import {createSporeStorage} from '../spores.js'


export default class Inquisitor extends Entity {

    constructor (params = {}) {
        super({hitRadius: 0.3, ...params})

        this.create(Velocity)
        this.create(Steering)
        this.create(Health, {hp: 3})

        const {maxSpeed = 2, acceleration = 10} = params

        this.shootCooldown = 0
        this.shootInterval = params.shootInterval || 1.5

        this.maxSpeed = maxSpeed
        this.acceleration = acceleration
        this.rank = 2
        this.swarm = null
        this.spores = createSporeStorage()
    }


    move (direction) {
        this.direction = direction
    }


    update (deltaTime) {
        this.updateHealth(deltaTime)

        const world = this.host
        const enemy = world?.nearest(this, 4, e => e.team && e.team !== this.team)

        if (enemy) {
            this.#tryShoot(world, enemy, deltaTime)
        } else {
            this.shootCooldown = Math.max(0, this.shootCooldown - deltaTime)
        }

        this.wander(0.5)

        const neighbors = world?.entitiesInRange(this, 1)
        this.separate(neighbors, 0.6)

        applyLeash(this)
        this.move(this.resolveForce())
        applyMovement(this, deltaTime)
        this.clampVelocity(this.maxSpeed)
        this.applyVelocity(deltaTime)
    }


    #tryShoot (world, target, deltaTime) {
        this.shootCooldown -= deltaTime

        if (this.shootCooldown > 0) {
            return
        }

        const dir = target.position.clone().sub(this.position)
        const len = dir.length()

        if (len < 0.01) {
            return
        }

        dir.multiplyScalar(1 / len)

        world.spawnProjectile({
            x: this.x,
            y: this.y,
            dirX: dir.x,
            dirY: dir.y,
            speed: 5,
            team: this.team,
            source: this
        })

        this.shootCooldown = this.shootInterval
    }

}


function applyLeash (entity) {
    if (!entity.swarm) {
        return
    }

    const center = entity.swarm.getCenter()

    if (!center || center === entity.position) {
        return
    }

    const dx = entity.x - center.x
    const dy = entity.y - center.y
    const dist = Math.sqrt(dx * dx + dy * dy)
    const radius = entity.swarm.leashRadius

    if (dist > radius * 0.6) {
        const urgency = Math.min((dist - radius * 0.6) / (radius * 0.4), 1)
        entity.seek(center, urgency * 1.5)
    }
}


function applyMovement (entity, deltaTime) {
    if (entity.direction?.length() > 0) {
        const accel = entity.direction.clone().multiplyScalar(entity.acceleration * deltaTime)
        entity.velocity.add(accel)
    } else {
        entity.dampenVelocity(0.01, deltaTime)
    }
}
