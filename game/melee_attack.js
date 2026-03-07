import Component from './component.js'
import Vec2 from '../math/vec2.js'


export default class MeleeAttack extends Component {

    constructor (options = {}) {
        super(options)

        const {
            damage = 1,
            range = 0.6,
            cooldown = 1,
            windUp = 0.15,
            strikeTime = 0.1
        } = options

        this.meleeDamage = damage
        this.meleeRange = range
        this.meleeCooldown = cooldown
        this.windUp = windUp
        this.strikeTime = strikeTime

        this.cooldownTimer = 0
        this.phase = 'idle'
        this.phaseTimer = 0
        this.attackDirection = new Vec2()
        this.attackTarget = null
    }


    onInstall (host) {
        this.delegateTo(host, ['meleeAttack', 'updateMeleeAttack', 'isAttacking'])
    }


    isAttacking () {
        return this.phase !== 'idle'
    }


    get attackProgress () {
        if (this.phase === 'winding') {
            return 1 - this.phaseTimer / this.windUp
        }
        if (this.phase === 'striking') {
            return 1 - this.phaseTimer / this.strikeTime
        }
        return 0
    }


    meleeAttack (target) {
        if (this.phase !== 'idle' || this.cooldownTimer > 0) {
            return false
        }

        const dir = target.position.clone().sub(this.host.position)
        const dist = dir.length()

        if (dist > this.meleeRange + (this.host.hitRadius || 0) + (target.hitRadius || 0)) {
            return false
        }

        if (dist > 0.01) {
            dir.multiplyScalar(1 / dist)
        }

        this.attackDirection.copy(dir)
        this.attackTarget = target
        this.phase = 'winding'
        this.phaseTimer = this.windUp

        return true
    }


    updateMeleeAttack (deltaTime) {
        if (this.cooldownTimer > 0) {
            this.cooldownTimer = Math.max(0, this.cooldownTimer - deltaTime)
        }

        if (this.phase === 'idle') {
            return
        }

        this.phaseTimer -= deltaTime

        if (this.phase === 'winding' && this.phaseTimer <= 0) {
            this.phase = 'striking'
            this.phaseTimer = this.strikeTime
            this.#strike()
        } else if (this.phase === 'striking' && this.phaseTimer <= 0) {
            this.phase = 'idle'
            this.phaseTimer = 0
            this.cooldownTimer = this.meleeCooldown * (this.host?.getCooldownModifier?.() ?? 1)
            this.attackTarget = null
        }
    }


    #strike () {
        this.host.emit('strike', {
            target: this.attackTarget,
            direction: this.attackDirection,
            damage: this.meleeDamage
        })
    }

}
