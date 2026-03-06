import Entity from '../../game/entity.js'
import Velocity from '../../game/velocity.js'


export default class Rat extends Entity {

    constructor (params = {}) {
        super(params)

        this.create(Velocity)

        const {maxSpeed = 5, acceleration = 40} = params

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


function applyMovement (rat, deltaTime) {
    if (rat.direction?.length() > 0) {
        const accel = rat.direction.clone().multiplyScalar(rat.acceleration * deltaTime)
        rat.velocity.add(accel)
    } else {
        rat.dampenVelocity(0.01, deltaTime)
    }
}
