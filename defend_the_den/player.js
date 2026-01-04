import Entity from '../game/entity.js'


export default class Player extends Entity {

    constructor (params = {}) {
        super(params)

        const {maxSpeed = 3, acceleration = 25, boundaries = {min: -0.85, max: 1.55}} = params

        this.maxSpeed = maxSpeed
        this.acceleration = acceleration
        this.boundaries = boundaries

        this.shootCooldown = 0
        this.shootCooldownDuration = 0.35

        this.shootRecoilTimer = 0
        this.shootRecoilDuration = 0.1
    }


    move (direction) {
        this.direction = direction
    }


    canShoot () {
        return this.shootCooldown <= 0
    }


    hit (impactDirection) {
        this.emit('hit', {direction: impactDirection})
    }


    update (deltaTime) {
        updateShootCooldown(this, deltaTime)
        updateRecoilTimer(this, deltaTime)
        applyMovement(this, deltaTime)
        clampVelocity(this)
        applyVelocity(this, deltaTime)
        clampToBoundaries(this)
    }

}


function updateShootCooldown (player, deltaTime) {
    if (player.shootCooldown > 0) {
        player.shootCooldown -= deltaTime
    }
}


function updateRecoilTimer (player, deltaTime) {
    if (player.shootRecoilTimer > 0) {
        player.shootRecoilTimer -= deltaTime
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


function clampToBoundaries (player) {
    if (player.position.y > player.boundaries.max) {
        player.position.y = player.boundaries.max
        player.velocity.y = 0
    } else if (player.position.y < player.boundaries.min) {
        player.position.y = player.boundaries.min
        player.velocity.y = 0
    }
}
