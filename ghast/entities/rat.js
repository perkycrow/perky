import Entity from '../../game/entity.js'
import Velocity from '../../game/velocity.js'
import Steering from '../../game/steering.js'


export default class Rat extends Entity {

    constructor (params = {}) {
        super({hitRadius: 0.25, ...params})

        this.create(Velocity)
        this.create(Steering)

        const {maxSpeed = 3, acceleration = 25} = params

        this.maxSpeed = maxSpeed
        this.acceleration = acceleration
    }


    move (direction) {
        this.direction = direction
    }


    update (deltaTime) {
        const world = this.host
        const enemy = world.nearest(this, 4, e => e.team && e.team !== this.team)

        if (enemy) {
            this.flee(enemy.position, 1.5)
        }

        this.wander(0.6)

        const neighbors = world.entitiesInRange(this, 0.8)
        this.separate(neighbors, 1)

        this.move(this.resolveForce())
        applyMovement(this, deltaTime)
        this.clampVelocity(this.maxSpeed)
        this.applyVelocity(deltaTime)
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
