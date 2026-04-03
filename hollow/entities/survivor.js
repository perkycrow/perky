import Entity from '../../game/entity.js'
import Velocity from '../../game/velocity.js'


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
        this.moveDirection = {x: 0, y: 0}
    }


    move (x, y) {
        this.moveDirection.x = x
        this.moveDirection.y = y
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

    const {x, y} = survivor.moveDirection

    if (x !== 0 || y !== 0) {
        const length = Math.sqrt(x * x + y * y)
        survivor.velocity.x += (x / length) * MOVE_SPEED
        survivor.velocity.y += (y / length) * MOVE_SPEED
    }
}
