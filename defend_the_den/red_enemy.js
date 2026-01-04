import Enemy from './enemy.js'


export default class RedEnemy extends Enemy {

    static $tags = ['enemy', 'red']

    constructor (params = {}) {
        super({
            maxSpeed: 4,
            hp: 2,
            ...params
        })

        this.state = 'running'
        this.stateTimer = 0

        this.runDuration = 1.5 + Math.random() * 1.0
        this.stopDuration = 0.8
        this.throwDelay = 0.3

        this.hasThrown = false
    }


    applyMovement (deltaTime) {
        if (this.isStunned) {
            return
        }

        this.stateTimer += deltaTime

        if (this.state === 'running') {
            this.position.add(this.velocity.clone().multiplyScalar(deltaTime))

            if (this.stateTimer >= this.runDuration) {
                this.state = 'stopping'
                this.stateTimer = 0
                this.hasThrown = false
            }
        } else if (this.state === 'stopping') {
            if (!this.hasThrown && this.stateTimer >= this.throwDelay) {
                this.throwPie()
                this.hasThrown = true
            }

            if (this.stateTimer >= this.stopDuration) {
                this.state = 'running'
                this.stateTimer = 0
                this.runDuration = 1.5 + Math.random() * 1.0
            }
        }
    }


    throwPie () {
        this.emit('throw:pie', {
            x: this.position.x,
            y: this.position.y
        })
    }


    hit (impactDirection = {x: 1, y: 0}, knockbackForce = 3) {
        const isDead = super.hit(impactDirection, knockbackForce)

        if (this.state === 'stopping') {
            this.state = 'running'
            this.stateTimer = 0
        }

        return isDead
    }

}
