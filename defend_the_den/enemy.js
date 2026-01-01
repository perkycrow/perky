import Entity from '../game/entity.js'


export default class Enemy extends Entity {

    static $tags = ['enemy']

    constructor (params = {}) {
        super(params)

        const {
            maxSpeed = 3,
            boundaries = {min: -0.85, max: 1.55},
            hp = 2
        } = params

        this.velocity.set(-maxSpeed, 0)

        this.maxSpeed = maxSpeed
        this.boundaries = boundaries
        this.alive = true

        this.hp = hp
        this.maxHp = hp

        this.knockbackVelocity = {x: 0, y: 0}
        this.knockbackFriction = 8
        this.isStunned = false
        this.stunTimer = 0
        this.stunDuration = 0.15

        this.hitFlashTimer = 0
        this.hitFlashDuration = 0.1
    }


    hit (impactDirection = {x: 1, y: 0}, knockbackForce = 3) {
        this.hp -= 1

        this.knockbackVelocity.x = impactDirection.x * knockbackForce
        this.knockbackVelocity.y = impactDirection.y * knockbackForce * 0.5

        this.isStunned = true
        this.stunTimer = this.stunDuration

        this.hitFlashTimer = this.hitFlashDuration

        if (this.hp <= 0) {
            this.alive = false
            return true
        }

        return false
    }


    update (deltaTime) {
        this.updateTimers(deltaTime)
        this.applyKnockback(deltaTime)
        this.applyMovement(deltaTime)
        this.clampToBoundaries()
        this.checkDeath()
    }


    updateTimers (deltaTime) {
        if (this.hitFlashTimer > 0) {
            this.hitFlashTimer -= deltaTime
        }

        if (this.isStunned) {
            this.stunTimer -= deltaTime
            if (this.stunTimer <= 0) {
                this.isStunned = false
            }
        }
    }


    applyKnockback (deltaTime) {
        const hasKnockback = Math.abs(this.knockbackVelocity.x) > 0.01 || Math.abs(this.knockbackVelocity.y) > 0.01

        if (hasKnockback) {
            this.position.x += this.knockbackVelocity.x * deltaTime
            this.position.y += this.knockbackVelocity.y * deltaTime

            const friction = Math.exp(-this.knockbackFriction * deltaTime)
            this.knockbackVelocity.x *= friction
            this.knockbackVelocity.y *= friction
        }
    }


    applyMovement (deltaTime) {
        if (!this.isStunned) {
            this.position.add(this.velocity.clone().multiplyScalar(deltaTime))
        }
    }


    clampToBoundaries () {
        if (this.position.y > this.boundaries.max) {
            this.position.y = this.boundaries.max
        } else if (this.position.y < this.boundaries.min) {
            this.position.y = this.boundaries.min
        }
    }


    checkDeath () {
        if (this.position.x < -2.5) {
            this.alive = false
        }
    }

}
