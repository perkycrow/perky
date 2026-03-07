import Component from './component.js'
import Vec2 from '../math/vec2.js'


export default class Dash extends Component {

    constructor (options = {}) {
        super(options)

        this.timer = 0
        this.cooldownTimer = 0
        this.dashDirection = new Vec2()
        this.dashPower = 0
        this.dashDuration = 0
        this.dashCooldown = 0
        this.dashSustain = 0
    }


    onInstall (host) {
        this.delegateTo(host, ['dash', 'updateDash', 'cancelDash', 'isDashing'])
    }


    isDashing () {
        return this.timer > 0
    }


    get active () {
        return this.timer > 0
    }


    get onCooldown () {
        return this.cooldownTimer > 0
    }


    get progress () {
        if (this.dashDuration <= 0) {
            return 0
        }
        return 1 - Math.max(0, this.timer) / this.dashDuration
    }


    get remaining () {
        if (this.dashDuration <= 0) {
            return 0
        }
        return Math.max(0, this.timer) / this.dashDuration
    }


    dash (direction, options = {}) {
        if (this.active || this.onCooldown) {
            return false
        }

        const {
            power = 10,
            duration = 0.15,
            cooldown = 0.5,
            sustain = 0
        } = options

        const len = Math.sqrt(direction.x * direction.x + direction.y * direction.y)

        if (len === 0) {
            return false
        }

        this.dashDirection.set(direction.x / len, direction.y / len)
        this.dashPower = power
        this.dashDuration = duration
        this.dashCooldown = cooldown
        this.dashSustain = sustain
        this.timer = duration

        this.host.velocity.copy(
            this.dashDirection.clone().multiplyScalar(power)
        )

        return true
    }


    updateDash (deltaTime) {
        if (this.active) {
            this.timer -= deltaTime

            if (this.dashSustain > 0) {
                const force = this.dashPower * this.dashSustain * this.remaining
                this.host.velocity.addScaledVector(this.dashDirection, force * deltaTime * 60)
            }

            if (this.timer <= 0) {
                this.timer = 0
                this.cooldownTimer = this.dashCooldown
            }
        } else if (this.cooldownTimer > 0) {
            this.cooldownTimer = Math.max(0, this.cooldownTimer - deltaTime)
        }
    }


    cancelDash () {
        this.timer = 0
        this.cooldownTimer = 0
    }

}
