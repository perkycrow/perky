import Entity from '../game/entity.js'
import Easing from '../math/easing.js'


export default class Enemy extends Entity {

    static $tags = ['enemy']

    constructor (params = {}) {
        super(params)

        const {
            maxSpeed = 3,
            boundaries = {min: -0.85, max: 1.55},
            hp = 3
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

        this.shuffleTimer = 0
        this.shuffleDuration = 0.8 + Math.random() * 0.6
        this.shuffleProgress = Math.random()
        this.minSpeedRatio = 0.15
        this.maxSpeedRatio = 1.0
        this.speedMultiplier = 1.0

        this.updateShuffleForDamage()
    }


    get damageRatio () {
        return 1 - (this.hp / this.maxHp)
    }


    updateShuffleForDamage () {
        const hpLost = this.maxHp - this.hp

        if (hpLost === 0) {
            this.shuffleDuration = 0.8 + Math.random() * 0.6
            this.minSpeedRatio = 0.2
            this.maxSpeedRatio = 1.0
            this.speedMultiplier = 1.0
        } else if (hpLost === 1) {
            this.shuffleDuration = 1.2 + Math.random() * 0.8
            this.minSpeedRatio = 0.05
            this.maxSpeedRatio = 1.1
            this.speedMultiplier = 1.0
        } else {
            this.shuffleDuration = 0.4 + Math.random() * 0.3
            this.minSpeedRatio = 0.3
            this.maxSpeedRatio = 1.3
            this.speedMultiplier = 2.0
        }
    }


    hit (impactDirection = {x: 1, y: 0}, knockbackForce = 3) {
        this.hp -= 1

        this.knockbackVelocity.x = impactDirection.x * knockbackForce
        this.knockbackVelocity.y = impactDirection.y * knockbackForce * 0.5

        this.isStunned = true
        this.stunTimer = this.stunDuration

        this.hitFlashTimer = this.hitFlashDuration

        this.updateShuffleForDamage()

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
        if (this.isStunned) {
            return
        }

        this.shuffleTimer += deltaTime
        this.shuffleProgress = (this.shuffleTimer / this.shuffleDuration) % 1

        const wave = Math.sin(this.shuffleProgress * Math.PI * 2)
        const easedWave = Easing.easeInOutQuad((wave + 1) / 2)
        const speedRatio = this.minSpeedRatio + easedWave * (this.maxSpeedRatio - this.minSpeedRatio)

        this.position.add(this.velocity.clone().multiplyScalar(deltaTime * speedRatio * this.speedMultiplier))
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
