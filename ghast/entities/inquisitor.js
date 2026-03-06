import Entity from '../../game/entity.js'
import Velocity from '../../game/velocity.js'
import Steering from '../../game/steering.js'


export default class Inquisitor extends Entity {

    constructor (params = {}) {
        super({hitRadius: 0.3, ...params})

        this.create(Velocity)
        this.create(Steering)

        const {maxSpeed = 2, acceleration = 10} = params

        this.shootCooldown = 0
        this.shootInterval = params.shootInterval || 1.5

        this.maxSpeed = maxSpeed
        this.acceleration = acceleration
    }


    move (direction) {
        this.direction = direction
    }


    update (deltaTime) {
        const world = this.host
        const enemy = world.nearest(this, 6, e => e.team && e.team !== this.team)

        if (enemy) {
            this.arrive(enemy.position, 1, 1.5)
            this.#tryShoot(world, enemy, deltaTime)
        } else {
            this.wander(0.3)
        }

        const neighbors = world.entitiesInRange(this, 1)
        this.separate(neighbors, 0.6)

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


function applyMovement (entity, deltaTime) {
    if (entity.direction?.length() > 0) {
        const accel = entity.direction.clone().multiplyScalar(entity.acceleration * deltaTime)
        entity.velocity.add(accel)
    } else {
        entity.dampenVelocity(0.01, deltaTime)
    }
}
