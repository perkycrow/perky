import Enemy from './enemy.js'
import Easing from '../math/easing.js'


export default class PigEnemy extends Enemy {

    static $tags = ['enemy', 'pig']

    constructor (params = {}) {
        super(params)

        this.shuffleTimer = 0
        this.shuffleDuration = 0.8 + Math.random() * 0.6
        this.shuffleProgress = Math.random()
        this.minSpeedRatio = 0.15
        this.maxSpeedRatio = 1.0
        this.speedMultiplier = 1.0

        this.updateShuffleForDamage()
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
        const isDead = super.hit(impactDirection, knockbackForce)
        this.updateShuffleForDamage()
        return isDead
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

}
