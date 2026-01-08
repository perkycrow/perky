import Entity from '../game/entity.js'
import {CapsuleHitbox} from './collision_shapes.js'


export default class Player extends Entity {

    constructor (params = {}) {
        super(params)

        const {maxSpeed = 3, acceleration = 25, boundaries = {min: -1.25, max: 1.15}} = params

        this.maxSpeed = maxSpeed
        this.acceleration = acceleration
        this.boundaries = boundaries

        this.shootCooldown = 0
        this.shootCooldownDuration = 0.35

        this.shootRecoilTimer = 0
        this.shootRecoilDuration = 0.1

        this.stunTimer = 0
        this.isStunned = false

        this.hitbox = new CapsuleHitbox({
            radius: 0.25,
            height: 0.5,
            offsetY: 0.45
        })
    }


    move (direction) {
        this.direction = direction
    }


    canShoot () {
        return this.shootCooldown <= 0 && !this.isStunned
    }


    hit (impactDirection) {
        this.emit('hit', {direction: impactDirection})
    }


    stun (duration) {
        this.isStunned = true
        this.stunTimer = duration
        this.emit('stunned', {duration})
    }


    update (deltaTime) {
        updateStunTimer(this, deltaTime)
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
    if (player.isStunned) {
        player.velocity.multiplyScalar(Math.pow(0.1, deltaTime * 60))
        return
    }

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


function updateStunTimer (player, deltaTime) {
    if (player.stunTimer > 0) {
        player.stunTimer -= deltaTime
        if (player.stunTimer <= 0) {
            player.isStunned = false
        }
    }
}
