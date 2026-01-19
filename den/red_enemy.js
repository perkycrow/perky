import Enemy from './enemy.js'
import {CapsuleHitbox} from './collision_shapes.js'


export default class RedEnemy extends Enemy {

    static $tags = ['enemy', 'red']

    constructor (params = {}) {
        super({
            maxSpeed: 2,
            hp: 2,
            ...params
        })

        this.hitbox = new CapsuleHitbox({
            radius: 0.2,
            height: 0.4,
            offsetY: 0.35
        })

        this.state = 'hopping'
        this.stateTimer = 0

        this.hopDuration = 0.4
        this.hopPauseDuration = 0.15
        this.hopProgress = 0
        this.hopCount = 0
        this.hopsBeforeStop = 3 + Math.floor(Math.random() * 3)

        this.stopDuration = 0.8
        this.throwDelay = 0.3
        this.hasThrown = false
    }


    applyMovement (deltaTime) {
        if (this.isStunned) {
            return
        }

        this.stateTimer += deltaTime
        this[this.state](deltaTime)
    }


    hopping (deltaTime) {
        this.hopProgress = Math.min(1, this.stateTimer / this.hopDuration)

        const hopCurve = Math.sin(this.hopProgress * Math.PI)
        const speedMultiplier = 0.25 + hopCurve * 1.5

        this.position.add(this.velocity.clone().multiplyScalar(deltaTime * speedMultiplier))

        if (this.stateTimer >= this.hopDuration) {
            this.hopCount++
            this.stateTimer = 0

            if (this.hopCount >= this.hopsBeforeStop) {
                this.state = 'stopping'
                this.hopCount = 0
                this.hasThrown = false
            } else {
                this.state = 'hopPause'
            }
        }
    }


    hopPause () {
        if (this.stateTimer >= this.hopPauseDuration) {
            this.state = 'hopping'
            this.stateTimer = 0
        }
    }


    stopping () {
        if (!this.hasThrown && this.stateTimer >= this.throwDelay) {
            this.throwPie()
            this.hasThrown = true
        }

        if (this.stateTimer >= this.stopDuration) {
            this.state = 'hopping'
            this.stateTimer = 0
            this.hopsBeforeStop = 3 + Math.floor(Math.random() * 3)
        }
    }


    throwPie () {
        const sprites = ['pie', 'cake']
        const sprite = sprites[Math.floor(Math.random() * sprites.length)]

        this.emit('throw:pie', {
            x: this.position.x,
            y: this.position.y + 0.25,
            sprite
        })
    }


    hit (impactDirection = {x: 1, y: 0}, knockbackForce = 3) {
        const isDead = super.hit(impactDirection, knockbackForce)

        if (this.state === 'stopping') {
            this.state = 'hopping'
            this.stateTimer = 0
            this.hopCount = 0
        }

        return isDead
    }

}
