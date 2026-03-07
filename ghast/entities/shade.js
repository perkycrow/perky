import Entity from '../../game/entity.js'
import Velocity from '../../game/velocity.js'
import Steering from '../../game/steering.js'
import Dash from '../../game/dash.js'
import Health from '../../game/health.js'
import MeleeAttack from '../../game/melee_attack.js'
import BuffSystem from '../../game/buff_system.js'
import CombatStats from '../combat_stats.js'
import {createSporeStorage} from '../spores.js'
import {getSporeValue} from '../spore_effects.js'
import {applyLeash, applyMovement} from '../entity_helpers.js'


export default class Shade extends Entity {

    constructor (params = {}) {
        super({hitRadius: 0.3, ...params})

        this.create(Velocity)
        this.create(Steering)
        this.create(Dash)
        this.create(Health, {hp: 5})
        this.create(MeleeAttack, {damage: 2, range: 0.5, cooldown: 1, windUp: 0.15, strikeTime: 0.1})

        const {maxSpeed = 1, acceleration = 5} = params

        this.maxSpeed = maxSpeed
        this.acceleration = acceleration
        this.create(BuffSystem)
        this.create(CombatStats)

        this.rank = 3
        this.baseRank = 3
        this.target = null
        this.baseDetectRange = 1
        this.swarm = null
        this.spores = createSporeStorage()

        this.on('strike', ({target}) => {
            this.host?.emit('hit', {source: this, target})
        })
    }


    update (deltaTime) {
        this.updateHealth(deltaTime)
        this.updateMeleeAttack(deltaTime)
        this.updateDash(deltaTime)

        if (this.isDashing()) {
            this.clampVelocity(this.maxSpeed * 4)
            this.applyVelocity(deltaTime)
            return
        }

        if (this.isAttacking()) {
            this.dampenVelocity(0.001, deltaTime)
            this.applyVelocity(deltaTime)
            return
        }

        const enemy = this.target

        if (enemy) {
            this.seek(enemy.position, getSporeValue(this, 'approachWeight', 1))
            this.meleeAttack(enemy)
        } else if (this._battleCenter) {
            this.seek(this._battleCenter, 0.3)
        }

        this.wander(getSporeValue(this, 'wanderWeight', 0.3))

        const neighbors = this.host?.entitiesInRange(this, 1)
        this.separate(neighbors, 0.8)

        applyLeash(this)
        this.move(this.resolveForce())
        applyMovement(this, deltaTime)
        this.clampVelocity(getSporeValue(this, 'speed', this.maxSpeed))
        this.applyVelocity(deltaTime)
    }


    move (direction) {
        this.direction = direction
    }

}
