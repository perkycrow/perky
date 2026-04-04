import Entity from '../../game/entity.js'
import Velocity from '../../game/velocity.js'
import Vec2 from '../../math/vec2.js'


const MOVE_SPEED = 3
const BODY_RADIUS = 0.25
const DAMPEN_RATIO = 0.85


export default class Survivor extends Entity {

    static $tags = ['survivor']

    constructor (params = {}) {
        super(params)

        this.create(Velocity)

        this.bodyRadius = BODY_RADIUS
        this.colorIndex = params.colorIndex ?? 0
        this.alive = true
        this.moveDirection = new Vec2()
    }


    move (x, y) {
        this.moveDirection.set(x, y)
    }


    update (deltaTime) {
        applyMovement(this)
        this.dampenVelocity(DAMPEN_RATIO, deltaTime)
        this.applyVelocity(deltaTime)
    }

}


function applyMovement (survivor) {
    if (!survivor.alive) {
        return
    }

    const {moveDirection} = survivor
    const length = moveDirection.length()

    if (length > 0) {
        survivor.velocity.addScaledVector(moveDirection, MOVE_SPEED / length)
    }
}
