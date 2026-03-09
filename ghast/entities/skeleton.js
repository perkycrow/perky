import Entity from '../../game/entity.js'
import Velocity from '../../game/velocity.js'
import Steering from '../../game/steering.js'
import Dash from '../../game/dash.js'
import Health from '../../game/health.js'
import MeleeAttack from '../../game/melee_attack.js'
import BuffSystem from '../../game/buff_system.js'
import CombatStats from '../combat_stats.js'
import {createSporeStorage, createImprintStorage} from '../spores.js'
import {getRankModifier} from '../rank.js'
import {getCooldownModifier, updateMelee} from '../entity_helpers.js'


export default class Skeleton extends Entity {

    constructor (params = {}) {
        super({hitRadius: 0.3, ...params})

        this.rank = params.rank || 1

        this.create(Velocity)
        this.create(Steering)
        this.create(Dash)
        this.create(Health, {hp: Math.round(60 * getRankModifier(this.rank, 'hp'))})
        this.create(MeleeAttack, {damage: 11, range: 0.7, cooldown: 1.2 * getRankModifier(this.rank, 'cooldown'), windUp: 0.15, strikeTime: 0.1})

        const {maxSpeed = 0.5, acceleration = 5} = params

        this.maxSpeed = maxSpeed
        this.acceleration = acceleration
        this.dashMultiplier = 5
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
        updateMelee(this, deltaTime)
    }


    getCooldownModifier () {
        return getCooldownModifier(this)
    }


    move (direction) {
        this.direction = direction
    }

}
