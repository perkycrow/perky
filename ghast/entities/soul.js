import Entity from '../../game/entity.js'
import Velocity from '../../game/velocity.js'
import Steering from '../../game/steering.js'
import Health from '../../game/health.js'
import {applyMovement} from '../entity_helpers.js'


export default class Soul extends Entity {

    constructor (params = {}) {
        super({hitRadius: 0.3, ...params})

        this.create(Velocity)
        this.create(Steering)
        this.create(Health, {hp: 2})

        const {maxSpeed = 2.5, acceleration = 15} = params

        this.maxSpeed = maxSpeed
        this.acceleration = acceleration
    }


    move (direction) {
        this.direction = direction
    }


    update (deltaTime) {
        this.updateHealth(deltaTime)

        const world = this.host
        const ally = world.nearest(this, 6, e => e.faction === this.faction)

        if (ally) {
            this.arrive(ally.position, 0.8, 2)
        }

        this.wander(0.5)

        const neighbors = world.entitiesInRange(this, 1)
        this.separate(neighbors, 0.8)

        this.move(this.resolveForce())
        applyMovement(this, deltaTime)
        this.clampVelocity(this.maxSpeed)
        this.applyVelocity(deltaTime)
    }

}
