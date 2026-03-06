import Entity from '../../game/entity.js'
import Velocity from '../../game/velocity.js'


export default class Shade extends Entity {

    constructor (params = {}) {
        super(params)

        this.create(Velocity)

        const {maxSpeed = 3, acceleration = 25} = params

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


function applyMovement (shade, deltaTime) {
    if (shade.direction?.length() > 0) {
        const accel = shade.direction.clone().multiplyScalar(shade.acceleration * deltaTime)
        shade.velocity.add(accel)
    } else {
        shade.dampenVelocity(0.01, deltaTime)
    }
}
