import Entity from '../../game/entity.js'
import Velocity from '../../game/velocity.js'
import Steering from '../../game/steering.js'
import Health from '../../game/health.js'
import MeleeAttack from '../../game/melee_attack.js'
import BuffSystem from '../../game/buff_system.js'
import CombatStats from '../combat_stats.js'
import {createSporeStorage} from '../spores.js'
import {getSporeValue} from '../spore_effects.js'


export default class Rat extends Entity {

    constructor (params = {}) {
        super({hitRadius: 0.25, ...params})

        this.create(Velocity)
        this.create(Steering)
        this.create(Health, {hp: 1})
        this.create(MeleeAttack, {damage: 1, range: 0.3, cooldown: 0.8, windUp: 0.1, strikeTime: 0.08})

        const {maxSpeed = 1.5, acceleration = 8} = params

        this.maxSpeed = maxSpeed
        this.acceleration = acceleration
        this.create(BuffSystem)
        this.create(CombatStats)

        this.rank = 1
        this.baseRank = 1
        this.swarm = null
        this.spores = createSporeStorage()

        this.on('strike', ({target}) => {
            this.host?.emit('hit', {source: this, target})
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

        const world = this.host
        const detectRange = getSporeValue(this, 'detectRange', 0.8)
        const enemy = world?.nearest(this, detectRange, e => e.faction && e.faction !== this.faction)

        if (enemy) {
            this.seek(enemy.position, getSporeValue(this, 'approachWeight', 1))
            this.meleeAttack(enemy)
        }

        this.wander(getSporeValue(this, 'wanderWeight', 0.3))

        const neighbors = world?.entitiesInRange(this, 0.8)
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


function applyLeash (entity) {
    if (!entity.swarm) {
        return
    }

    const center = entity.swarm.getCenter()

    if (!center || center === entity.position) {
        return
    }

    const dx = entity.x - center.x
    const dy = entity.y - center.y
    const dist = Math.sqrt(dx * dx + dy * dy)
    const radius = entity.swarm.leashRadius

    if (dist > radius * 0.6) {
        const urgency = Math.min((dist - radius * 0.6) / (radius * 0.4), 1)
        entity.seek(center, urgency * 1.5)
    }
}


function applyMovement (entity, deltaTime) {
    if (entity.direction?.length() > 0) {
        const accel = entity.direction.clone().multiplyScalar(entity.acceleration * deltaTime)
        entity.velocity.add(accel)
    } else {
        entity.dampenVelocity(0.01, deltaTime)
    }
}
