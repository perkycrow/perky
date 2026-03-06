import Entity from '../../game/entity.js'
import Velocity from '../../game/velocity.js'
import Steering from '../../game/steering.js'


export default class Inquisitor extends Entity {

    constructor (params = {}) {
        super(params)

        this.create(Velocity)
        this.create(Steering)

        const {maxSpeed = 2, acceleration = 10} = params

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

}


function applyMovement (entity, deltaTime) {
    if (entity.direction?.length() > 0) {
        const accel = entity.direction.clone().multiplyScalar(entity.acceleration * deltaTime)
        entity.velocity.add(accel)
    } else {
        entity.dampenVelocity(0.01, deltaTime)
    }
}
