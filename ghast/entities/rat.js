import Entity from '../../game/entity.js'
import Velocity from '../../game/velocity.js'
import Steering from '../../game/steering.js'
import Health from '../../game/health.js'
import MeleeAttack from '../../game/melee_attack.js'
import BuffSystem from '../../game/buff_system.js'
import CombatStats from '../combat_stats.js'
import {createSporeStorage, createImprintStorage} from '../spores.js'
import {getSporeValue} from '../spore_effects.js'
import {applyLeash, applyMovement} from '../entity_helpers.js'


export default class Rat extends Entity {

    constructor (params = {}) {
        super({hitRadius: 0.25, ...params})

        this.create(Velocity)
        this.create(Steering)
        this.create(Health, {hp: 8})
        this.create(MeleeAttack, {damage: 4, range: 0.3, cooldown: 0.5, windUp: 0.1, strikeTime: 0.08})

        const {maxSpeed = 2, acceleration = 8} = params

        this.maxSpeed = maxSpeed
        this.acceleration = acceleration
        this.create(BuffSystem)
        this.create(CombatStats)

        this.rank = 1
        this.baseRank = 1
        this.target = null
        this.baseDetectRange = 2
        this.swarm = null
        this.spores = createSporeStorage()
        this.imprint = createImprintStorage()

        this.on('strike', ({target, damage}) => {
            this.host?.emit('hit', {source: this, target, damage})
        })
    }


    update (deltaTime) {
        this.updateHealth(deltaTime)
        this.updateMeleeAttack(deltaTime)

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

        const neighbors = this.host?.entitiesInRange(this, 0.8)
        this.separate(neighbors, 1)

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
