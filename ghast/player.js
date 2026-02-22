import Entity from '../game/entity.js'
import Velocity from '../game/velocity.js'


export default class Player extends Entity {

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


function applyMovement (player, deltaTime) {
    if (player.direction?.length() > 0) {
        const accel = player.direction.clone().multiplyScalar(player.acceleration * deltaTime)
        player.velocity.add(accel)
    } else {
        player.velocity.multiplyScalar(Math.pow(0.01, deltaTime * 60))
    }
}
