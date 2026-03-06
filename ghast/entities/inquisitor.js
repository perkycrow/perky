import Entity from '../../game/entity.js'
import Velocity from '../../game/velocity.js'


export default class Inquisitor extends Entity {

    constructor (params = {}) {
        super(params)

        this.create(Velocity)

        const {maxSpeed = 2, acceleration = 10} = params

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


function applyMovement (inquisitor, deltaTime) {
    if (inquisitor.direction?.length() > 0) {
        const accel = inquisitor.direction.clone().multiplyScalar(inquisitor.acceleration * deltaTime)
        inquisitor.velocity.add(accel)
    } else {
        inquisitor.dampenVelocity(0.01, deltaTime)
    }
}
