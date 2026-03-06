import Entity from '../../game/entity.js'
import Velocity from '../../game/velocity.js'


export default class Soul extends Entity {

    constructor (params = {}) {
        super(params)

        this.create(Velocity)

        const {maxSpeed = 2.5, acceleration = 15} = params

        this.maxSpeed = maxSpeed
        this.acceleration = acceleration
    }


    move (direction) {
        this.direction = direction
    }


    update (deltaTime) {
        applyMovement(this, deltaTime)
        this.clampVelocity(this.maxSpeed)
        this.applyVelocity(deltaTime)
    }

}


function applyMovement (soul, deltaTime) {
    if (soul.direction?.length() > 0) {
        const accel = soul.direction.clone().multiplyScalar(soul.acceleration * deltaTime)
        soul.velocity.add(accel)
    } else {
        soul.dampenVelocity(0.01, deltaTime)
    }
}
