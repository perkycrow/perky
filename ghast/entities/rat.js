import Entity from '../../game/entity.js'
import Velocity from '../../game/velocity.js'
import Steering from '../../game/steering.js'
import Health from '../../game/health.js'
import MeleeAttack from '../../game/melee_attack.js'
import {createSporeStorage} from '../spores.js'


export default class Rat extends Entity {

    constructor (params = {}) {
        super({hitRadius: 0.25, ...params})

        this.create(Velocity)
        this.create(Steering)
        this.create(Health, {hp: 1})
        this.create(MeleeAttack, {damage: 1, range: 0.3, cooldown: 0.8, windUp: 0.1, strikeTime: 0.08})

        const {maxSpeed = 3, acceleration = 25} = params

        this.maxSpeed = maxSpeed
        this.acceleration = acceleration
        this.rank = 1
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
        const enemy = world?.nearest(this, 0.8, e => e.team && e.team !== this.team)

        if (enemy) {
            this.meleeAttack(enemy)
        }

        this.wander(0.5)

        const neighbors = world?.entitiesInRange(this, 0.8)
        this.separate(neighbors, 1)

        applyLeash(this)
        this.move(this.resolveForce())
        applyMovement(this, deltaTime)
        this.clampVelocity(this.maxSpeed)
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
