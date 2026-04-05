import Entity from '../../game/entity.js'
import Hitbox from '../../game/hitbox.js'
import Velocity from '../../game/velocity.js'
import Steering from '../../game/steering.js'
import {SPORE_DEFINITIONS} from '../spores/index.js'
import {applyMovement} from '../entity_helpers.js'


const COLLECT_RADIUS = 0.5
const DRIFT_SPEED = 0.3
const DRIFT_RANGE = 1


export default class SporeItem extends Entity {

    constructor (params = {}) {
        super(params)

        this.create(Hitbox, {radius: COLLECT_RADIUS})
        this.create(Velocity)
        this.create(Steering)

        this.sporeType = params.sporeType || 'fear'
        this.originX = params.x || 0
        this.originY = params.y || 0
        this.maxSpeed = DRIFT_SPEED
        this.acceleration = 2
    }


    get sporeColor () {
        return SPORE_DEFINITIONS[this.sporeType]?.color || '#ffffff'
    }


    update (deltaTime) {
        const dx = this.x - this.originX
        const dy = this.y - this.originY
        const dist = Math.sqrt(dx * dx + dy * dy)

        if (dist > DRIFT_RANGE) {
            this.seek({x: this.originX, y: this.originY}, 0.5)
        }

        this.wander(0.3)
        this.move(this.resolveForce())
        applyMovement(this, deltaTime)
        this.clampVelocity(this.maxSpeed)
        this.applyVelocity(deltaTime)
    }


    move (direction) {
        this.direction = direction
    }

}
