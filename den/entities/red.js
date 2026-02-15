import Enemy from './enemy.js'
import {CapsuleHitbox} from '../collision_shapes.js'


export default class Red extends Enemy {

    static $tags = ['enemy', 'red']

    constructor (params = {}) {
        super({
            maxSpeed: 0.5,
            hp: 2,
            ...params
        })

        this.hitbox = new CapsuleHitbox({
            radius: 0.2,
            height: 0.4,
            offsetY: 0.35
        })

        this.state = 'moving'
        this.stateTimer = 0

        this.moveDuration = 1.5 + Math.random()
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


    moving (deltaTime) {
        this.position.add(this.velocity.clone().multiplyScalar(deltaTime))

        if (this.stateTimer >= this.moveDuration) {
            this.state = 'stopping'
            this.stateTimer = 0
            this.hasThrown = false
        }
    }


    stopping () {
        if (!this.hasThrown && this.stateTimer >= this.throwDelay) {
            this.throwPie()
            this.hasThrown = true
        }

        if (this.stateTimer >= this.stopDuration) {
            this.state = 'moving'
            this.stateTimer = 0
            this.moveDuration = 1.5 + Math.random()
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
            this.state = 'moving'
            this.stateTimer = 0
        }

        return isDead
    }

}
