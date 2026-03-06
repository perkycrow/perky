import Entity from '../../game/entity.js'
import Velocity from '../../game/velocity.js'
import Dash from '../../game/dash.js'


export default class Shade extends Entity {

    constructor (params = {}) {
        super(params)

        this.create(Velocity)
        this.create(Dash)

        const {maxSpeed = 3, acceleration = 25} = params

        this.maxSpeed = maxSpeed
        this.acceleration = acceleration
    }


    move (direction) {
        this.direction = direction
    }


    triggerDash () {
        const dir = this.velocity.length() > 0.1
            ? this.velocity.clone().normalize()
            : this.direction?.length() > 0
                ? this.direction.clone()
                : null

        if (dir) {
            this.dash(dir, {power: 12, duration: 0.12, cooldown: 0.6})
        }
    }


    update (deltaTime) {
        this.updateDash(deltaTime)

        if (!this.isDashing()) {
            applyMovement(this, deltaTime)
        }

        this.clampVelocity(this.isDashing() ? this.maxSpeed * 4 : this.maxSpeed)
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
