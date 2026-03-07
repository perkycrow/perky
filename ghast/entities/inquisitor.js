import Entity from '../../game/entity.js'
import Velocity from '../../game/velocity.js'
import Steering from '../../game/steering.js'
import Health from '../../game/health.js'
import BuffSystem from '../../game/buff_system.js'
import CombatStats from '../combat_stats.js'
import {createSporeStorage} from '../spores.js'
import {getSporeValue} from '../spore_effects.js'
import {applyLeash, applyMovement} from '../entity_helpers.js'


export default class Inquisitor extends Entity {

    constructor (params = {}) {
        super({hitRadius: 0.3, ...params})

        this.create(Velocity)
        this.create(Steering)
        this.create(Health, {hp: 3})

        const {maxSpeed = 0.8, acceleration = 4} = params

        this.shootCooldown = 0
        this.shootInterval = params.shootInterval || 1.5

        this.maxSpeed = maxSpeed
        this.acceleration = acceleration
        this.create(BuffSystem)
        this.create(CombatStats)

        this.rank = 2
        this.baseRank = 2
        this.target = null
        this.baseDetectRange = 4
        this.swarm = null
        this.spores = createSporeStorage()
    }


    move (direction) {
        this.direction = direction
    }


    update (deltaTime) {
        this.updateHealth(deltaTime)

        const enemy = this.target

        if (enemy) {
            this.#tryShoot(this.host, enemy, deltaTime)
        } else {
            this.shootCooldown = Math.max(0, this.shootCooldown - deltaTime)

            if (this._battleCenter) {
                this.seek(this._battleCenter, 0.3)
            }
        }

        this.wander(getSporeValue(this, 'wanderWeight', 0.3))

        const neighbors = this.host?.entitiesInRange(this, 1)
        this.separate(neighbors, 0.6)

        applyLeash(this)
        this.move(this.resolveForce())
        applyMovement(this, deltaTime)
        this.clampVelocity(getSporeValue(this, 'speed', this.maxSpeed))
        this.applyVelocity(deltaTime)
    }


    #tryShoot (world, target, deltaTime) {
        this.shootCooldown -= deltaTime

        if (this.shootCooldown > 0) {
            return
        }

        const dir = target.position.clone().sub(this.position)
        const len = dir.length()

        if (len < 0.01) {
            return
        }

        dir.multiplyScalar(1 / len)

        world.spawnProjectile({
            x: this.x,
            y: this.y,
            dirX: dir.x,
            dirY: dir.y,
            speed: 5,
            faction: this.faction,
            source: this
        })

        this.shootCooldown = this.shootInterval
    }

}
