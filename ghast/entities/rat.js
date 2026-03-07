import Entity from '../../game/entity.js'
import Velocity from '../../game/velocity.js'
import Steering from '../../game/steering.js'
import Health from '../../game/health.js'
import MeleeAttack from '../../game/melee_attack.js'
import BuffSystem from '../../game/buff_system.js'
import CombatStats from '../combat_stats.js'
import {createSporeStorage, createImprintStorage} from '../spores.js'
import {getRankModifier} from '../rank.js'
import {applyLeash, applyMovement, getEffectiveStat} from '../entity_helpers.js'


export default class Rat extends Entity {

    constructor (params = {}) {
        super({hitRadius: 0.25, ...params})

        this.rank = params.rank || 1

        this.create(Velocity)
        this.create(Steering)
        this.create(Health, {hp: Math.round(35 * getRankModifier(this.rank, 'hp'))})
        this.create(MeleeAttack, {damage: 8, range: 0.3, cooldown: 0.5 * getRankModifier(this.rank, 'cooldown'), windUp: 0.1, strikeTime: 0.08})

        const {maxSpeed = 1.2, acceleration = 5} = params

        this.maxSpeed = maxSpeed
        this.acceleration = acceleration
        this.create(BuffSystem)
        this.create(CombatStats)
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
            this.seek(enemy.position, getEffectiveStat(this, 'approachWeight', 1))
            const fleeWeight = getEffectiveStat(this, 'fleeWeight', 1) - 1
            if (fleeWeight > 0) {
                this.flee(enemy.position, fleeWeight)
            }
            this.meleeAttack(enemy)
        } else if (this._battleCenter) {
            this.seek(this._battleCenter, 0.3)
        }

        this.wander(getEffectiveStat(this, 'wanderWeight', 0.3))

        const neighbors = this.host?.entitiesInRange(this, 0.8)
        this.separate(neighbors, 1)

        applyLeash(this)
        this.move(this.resolveForce())
        applyMovement(this, deltaTime)
        this.clampVelocity(getEffectiveStat(this, 'speed', this.maxSpeed * getRankModifier(this.rank, 'speed')))
        this.applyVelocity(deltaTime)
    }


    move (direction) {
        this.direction = direction
    }

}
