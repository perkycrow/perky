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


    move (direction) {
        this.direction = direction
    }


    update (deltaTime) {
        const world = this.host

        this.updateHealth(deltaTime)
        this.updateDash(deltaTime)
        this.updateMeleeAttack(deltaTime)

        if (this.isDashing()) {
            this.#checkChargeHit(world)
            this.clampVelocity(this.maxSpeed * 5)
            this.applyVelocity(deltaTime)
            return
        }

        if (this.isAttacking()) {
            this.dampenVelocity(0.001, deltaTime)
            this.applyVelocity(deltaTime)
            return
        }

        const enemy = world.nearest(this, 5, e => e.team && e.team !== this.team)

        if (enemy) {
            const distSq = this.position.distanceToSquared(enemy.position)

            if (this.meleeAttack(enemy)) {
                // melee attack started
            } else if (distSq < 2.5 * 2.5 && !this.isAttacking()) {
                const dir = enemy.position.clone().sub(this.position)
                this.dash(dir, {power: 8, duration: 0.25, cooldown: 2, sustain: 0.8})
            } else {
                this.seek(enemy.position, 1)
            }
        } else {
            this.wander(0.5)
        }

        const neighbors = world.entitiesInRange(this, 1)
        this.separate(neighbors, 0.8)

        this.move(this.resolveForce())
        applyMovement(this, deltaTime)
        this.clampVelocity(this.maxSpeed)
        this.applyVelocity(deltaTime)
    }


    #checkChargeHit (world) {
        const hit = world.checkHit(this, e => {
            return e.team && e.team !== this.team && e.hitRadius > 0
        })

        if (hit) {
            world.emit('hit', {source: this, target: hit})
        }
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
