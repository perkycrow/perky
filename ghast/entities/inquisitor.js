import Entity from '../../game/entity.js'
import Hitbox from '../../game/hitbox.js'
import Velocity from '../../game/velocity.js'
import Steering from '../../game/steering.js'
import Health from '../../game/health.js'
import BuffSystem from '../../game/buff_system.js'
import CombatStats from '../combat_stats.js'
import {createSporeStorage, createImprintStorage} from '../spores.js'
import {getRankModifier} from '../rank.js'
import {applyLeash, applyMovement, applySporeFrame, getCooldownModifier, getEffectiveStat, getMaxSpeed, updateStamina} from '../entity_helpers.js'


export default class Inquisitor extends Entity {

    constructor (params = {}) {
        super(params)

        this.rank = params.rank || 1

        this.create(Hitbox, {radius: 0.3})
        this.create(Velocity)
        this.create(Steering)
        this.create(Health, {hp: Math.round(25 * getRankModifier(this.rank, 'hp'))})

        const {maxSpeed = 0.55, acceleration = 5} = params

        this.shootCooldown = 1.5
        this.shootInterval = (params.shootInterval || 2) * getRankModifier(this.rank, 'cooldown')
        this.shootDamage = params.shootDamage || 8

        this.maxSpeed = maxSpeed
        this.acceleration = acceleration
        this.create(BuffSystem)
        this.create(CombatStats)
        this.target = null
        this.baseDetectRange = 4
        this.swarm = null
        this.stamina = 70
        this.maxStamina = 70
        this.spores = createSporeStorage()
        this.imprint = createImprintStorage()
    }


    move (direction) {
        this.direction = direction
    }


    update (deltaTime) {
        updateStamina(this, deltaTime)
        this.updateHealth(deltaTime)

        const enemy = this.target

        if (enemy) {
            this.#updateCombat(enemy, deltaTime)
        } else {
            this.#updateIdle(deltaTime)
        }

        applyLeash(this)
        this.move(this.resolveForce())
        applyMovement(this, deltaTime)
        this.clampVelocity(getMaxSpeed(this))
        this.applyVelocity(deltaTime)
    }


    #updateCombat (enemy, deltaTime) {
        this.#tryShoot(this.host, enemy, deltaTime)

        const dist = this.position.distanceTo(enemy.position)

        if (dist < 1.5) {
            this.flee(enemy.position, 0.6)
        }

        applySporeFrame(this)
    }


    #updateIdle (deltaTime) {
        this.shootCooldown = Math.max(0, this.shootCooldown - deltaTime)

        if (this._battleCenter) {
            this.seek(this._battleCenter, 0.3)
        }

        applySporeFrame(this)
        this.wander(getEffectiveStat(this, 'wanderWeight', 0.3))

        const neighbors = this.host?.space?.entitiesInRange(this, 1) ?? []
        this.separate(neighbors, 0.6)
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
            speed: 3,
            faction: this.faction,
            source: this,
            damage: this.shootDamage
        })

        this.shootCooldown = this.shootInterval * getCooldownModifier(this)
    }

}
