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


export default class Skeleton extends Entity {

    constructor (params = {}) {
        super({hitRadius: 0.3, ...params})

        this.create(Velocity)
        this.create(Steering)
        this.create(Dash)
        this.create(Health, {hp: 3})
        this.create(MeleeAttack, {damage: 1, range: 0.5, cooldown: 1.2, windUp: 0.15, strikeTime: 0.1})

        const {maxSpeed = 0.8, acceleration = 4} = params

        this.maxSpeed = maxSpeed
        this.acceleration = acceleration
        this.create(BuffSystem)
        this.create(CombatStats)

        this.rank = 2
        this.baseRank = 2
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
            this.clampVelocity(this.maxSpeed * 5)
            this.applyVelocity(deltaTime)
            return
        }

        if (this.isAttacking()) {
            this.dampenVelocity(0.001, deltaTime)
            this.applyVelocity(deltaTime)
            return
        }

        const world = this.host
        const detectRange = getSporeValue(this, 'detectRange', 1)
        const enemy = world?.nearest(this, detectRange, e => e.faction && e.faction !== this.faction)

        if (enemy) {
            this.seek(enemy.position, getSporeValue(this, 'approachWeight', 1))
            this.meleeAttack(enemy)
        }

        this.wander(getSporeValue(this, 'wanderWeight', 0.3))

        const neighbors = world?.entitiesInRange(this, 1)
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
