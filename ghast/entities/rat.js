import Entity from '../../game/entity.js'
import Velocity from '../../game/velocity.js'
import Steering from '../../game/steering.js'
import Health from '../../game/health.js'
import MeleeAttack from '../../game/melee_attack.js'
import BuffSystem from '../../game/buff_system.js'
import CombatStats from '../combat_stats.js'
import {createSporeStorage, createImprintStorage} from '../spores.js'
import {getRankModifier} from '../rank.js'
import {getCooldownModifier, updateMelee} from '../entity_helpers.js'


export default class Rat extends Entity {

    constructor (params = {}) {
        super({hitRadius: 0.25, ...params})

        this.rank = params.rank || 1

        this.create(Velocity)
        this.create(Steering)
        this.create(Health, {hp: Math.round(40 * getRankModifier(this.rank, 'hp'))})
        this.create(MeleeAttack, {damage: 8, range: 0.5, cooldown: 0.5 * getRankModifier(this.rank, 'cooldown'), windUp: 0.1, strikeTime: 0.08})

        const {maxSpeed = 1.0, acceleration = 8} = params

        this.maxSpeed = maxSpeed
        this.acceleration = acceleration
        this.create(BuffSystem)
        this.create(CombatStats)
        this.target = null
        this.baseDetectRange = 4
        this.swarm = null
        this.stamina = 100
        this.maxStamina = 100
        this.spores = createSporeStorage()
        this.imprint = createImprintStorage()

        this.on('strike', ({target, damage}) => {
            this.host?.emit('hit', {source: this, target, damage})
        })
    }


    update (deltaTime) {
        updateMelee(this, deltaTime, {separateRange: 1.2, separateWeight: 1.2})
    }


    getCooldownModifier () {
        return getCooldownModifier(this)
    }


    move (direction) {
        this.direction = direction
    }

}
