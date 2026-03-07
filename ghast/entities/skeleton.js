import Entity from '../../game/entity.js'
import Velocity from '../../game/velocity.js'
import Steering from '../../game/steering.js'
import Dash from '../../game/dash.js'
import Health from '../../game/health.js'
import MeleeAttack from '../../game/melee_attack.js'


export default class Skeleton extends Entity {

    constructor (params = {}) {
        super({hitRadius: 0.3, ...params})

        this.create(Velocity)
        this.create(Steering)
        this.create(Dash)
        this.create(Health, {hp: 3})
        this.create(MeleeAttack, {damage: 1, range: 0.5, cooldown: 1.2, windUp: 0.15, strikeTime: 0.1})

        const {maxSpeed = 1.5, acceleration = 8} = params

        this.maxSpeed = maxSpeed
        this.acceleration = acceleration

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
        const enemy = world?.nearest(this, 1, e => e.team && e.team !== this.team)

        if (enemy) {
            this.meleeAttack(enemy)
        }

        this.wander(0.5)

        const neighbors = world?.entitiesInRange(this, 1)
        this.separate(neighbors, 0.8)

        this.move(this.resolveForce())
        applyMovement(this, deltaTime)
        this.clampVelocity(this.maxSpeed)
        this.applyVelocity(deltaTime)
    }


    move (direction) {
        this.direction = direction
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
