import Enemy from './enemy.js'


export default class GrannyEnemy extends Enemy {

    static $tags = ['enemy', 'granny']

    constructor (params = {}) {
        super({
            maxSpeed: 0.3,
            hp: 4,
            ...params
        })

        this.state = 'walking'
        this.stateTimer = 0

        this.walkDuration = 2.5 + Math.random() * 1.5
        this.stepTimer = 0
        this.stepDuration = 0.6
        this.stepProgress = 0

        this.chargeDuration = 0.8
        this.fireballCount = 3
        this.fireballDelay = 0.15
        this.fireballsFired = 0
        this.fireballTimer = 0
    }


    applyMovement (deltaTime) {
        if (this.isStunned) {
            return
        }

        this.stateTimer += deltaTime
        this[this.state](deltaTime)
    }


    walking (deltaTime) {
        this.stepTimer += deltaTime
        this.stepProgress = (this.stepTimer / this.stepDuration) % 1

        const stepCurve = Math.sin(this.stepProgress * Math.PI)
        const speedMultiplier = 0.3 + stepCurve * 0.7

        this.position.add(this.velocity.clone().multiplyScalar(deltaTime * speedMultiplier))

        if (this.stateTimer >= this.walkDuration) {
            this.state = 'charging'
            this.stateTimer = 0
            this.fireballsFired = 0
            this.fireballTimer = 0
        }
    }


    charging () {
        if (this.stateTimer >= this.chargeDuration) {
            this.state = 'firing'
            this.stateTimer = 0
        }
    }


    firing () {
        this.fireballTimer += this.stateTimer - (this.fireballTimer > 0 ? this.fireballTimer : 0)

        const expectedFireballs = Math.floor(this.stateTimer / this.fireballDelay)

        while (this.fireballsFired < expectedFireballs && this.fireballsFired < this.fireballCount) {
            this.fireFireball()
            this.fireballsFired++
        }

        if (this.fireballsFired >= this.fireballCount) {
            this.state = 'walking'
            this.stateTimer = 0
            this.walkDuration = 2.0 + Math.random() * 1.5
        }
    }


    fireFireball () {
        const spreadAngle = (this.fireballsFired - (this.fireballCount - 1) / 2) * 0.3

        this.emit('throw:fireball', {
            x: this.position.x,
            y: this.position.y,
            angle: spreadAngle
        })
    }


    hit (impactDirection = {x: 1, y: 0}, knockbackForce = 3) {
        const isDead = super.hit(impactDirection, knockbackForce)

        if (this.state === 'charging' || this.state === 'firing') {
            this.state = 'walking'
            this.stateTimer = 0
            this.fireballsFired = 0
        }

        return isDead
    }

}
