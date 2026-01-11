import Entity from '../game/entity.js'


export default class Player extends Entity {

    constructor (params = {}) {
        super(params)

        const {maxSpeed = 3, acceleration = 25} = params

        this.maxSpeed = maxSpeed
        this.acceleration = acceleration
    }


    move (direction) {
        this.direction = direction
    }


    update (deltaTime) {
        applyMovement(this, deltaTime)
        clampVelocity(this)
        applyVelocity(this, deltaTime)
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


function clampVelocity (player) {
    if (player.velocity.length() > player.maxSpeed) {
        player.velocity.normalize().multiplyScalar(player.maxSpeed)
    }

    if (player.velocity.length() < 0.01) {
        player.velocity.set(0, 0)
    }
}


function applyVelocity (player, deltaTime) {
    player.position.add(player.velocity.clone().multiplyScalar(deltaTime))
}
