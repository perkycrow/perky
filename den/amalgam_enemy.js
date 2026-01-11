import Enemy from './enemy.js'
import {CapsuleHitbox} from './collision_shapes.js'


export default class AmalgamEnemy extends Enemy {

    static $tags = ['enemy', 'amalgam']

    constructor (params = {}) {
        super({
            maxSpeed: 0.5,
            hp: 6,
            ...params
        })

        this.hitbox = new CapsuleHitbox({
            radius: 0.25,
            height: 0.6,
            offsetY: 0.5
        })

        this.state = 'stalking'
        this.stateTimer = 0

        this.stalkDuration = 2.0 + Math.random()
        this.laneChangeSpeed = 1.5
        this.targetY = this.position.y

        this.fearChargeDuration = 1.2
        this.fearActiveDuration = 0.8
        this.fearRadius = 1.5
        this.fearProgress = 0

        this.stepTimer = 0
        this.stepDuration = 0.5
        this.stepProgress = 0
    }


    applyMovement (deltaTime) {
        if (this.isStunned) {
            return
        }

        this.stateTimer += deltaTime
        this[this.state](deltaTime)
    }


    stalking (deltaTime) {
        this.stepTimer += deltaTime
        this.stepProgress = (this.stepTimer / this.stepDuration) % 1

        const stepCurve = Math.sin(this.stepProgress * Math.PI)
        const speedMultiplier = 0.4 + stepCurve * 0.6

        this.position.add(this.velocity.clone().multiplyScalar(deltaTime * speedMultiplier))

        const yDiff = this.targetY - this.position.y
        if (Math.abs(yDiff) > 0.05) {
            const yMove = Math.sign(yDiff) * Math.min(Math.abs(yDiff), this.laneChangeSpeed * deltaTime)
            this.position.y += yMove
        }

        if (this.stateTimer >= this.stalkDuration) {
            this.state = 'fearCharging'
            this.stateTimer = 0
            this.fearProgress = 0
        }
    }


    fearCharging () {
        this.fearProgress = Math.min(1, this.stateTimer / this.fearChargeDuration)

        if (this.stateTimer >= this.fearChargeDuration) {
            this.state = 'fearActive'
            this.stateTimer = 0
            this.emitFear()
        }
    }


    fearActive () {
        if (this.stateTimer >= this.fearActiveDuration) {
            this.state = 'stalking'
            this.stateTimer = 0
            this.stalkDuration = 1.5 + Math.random()
            this.fearProgress = 0
        }
    }


    emitFear () {
        this.emit('fear:pulse', {
            x: this.position.x,
            y: this.position.y,
            radius: this.fearRadius
        })
    }


    setTargetY (y) {
        this.targetY = Math.max(this.boundaries.min, Math.min(this.boundaries.max, y))
    }


    hit (impactDirection = {x: 1, y: 0}, knockbackForce = 3) {
        const isDead = super.hit(impactDirection, knockbackForce)

        if (this.state === 'fearCharging' || this.state === 'fearActive') {
            this.state = 'stalking'
            this.stateTimer = 0
            this.fearProgress = 0
        }

        return isDead
    }

}
