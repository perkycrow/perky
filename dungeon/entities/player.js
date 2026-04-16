import Entity from '../../game/entity.js'
import Vec3 from '../../math/vec3.js'


const GRAVITY = -20
const JUMP_SPEED = 7
const MOVE_SPEED = 4
const GROUND_Y = 0


export default class Player extends Entity {

    static $tags = ['player']

    constructor (params = {}) {
        super(params)

        this.position = new Vec3(params.x ?? 0, params.y ?? GROUND_Y, params.z ?? 0)
        this.velocity = new Vec3()
        this.yaw = params.yaw ?? 0
        this.pitch = params.pitch ?? 0
        this.onGround = true
        this.moveForward = 0
        this.moveStrafe = 0
    }


    setMoveInput (forward, strafe) {
        this.moveForward = forward
        this.moveStrafe = strafe
    }


    jump () {
        if (this.onGround) {
            this.velocity.y = JUMP_SPEED
            this.onGround = false
        }
    }


    update (deltaTime) {
        const sin = Math.sin(this.yaw)
        const cos = Math.cos(this.yaw)

        const fwdX = -sin
        const fwdZ = -cos
        const rightX = cos
        const rightZ = -sin

        this.velocity.x = (fwdX * this.moveForward + rightX * this.moveStrafe) * MOVE_SPEED
        this.velocity.z = (fwdZ * this.moveForward + rightZ * this.moveStrafe) * MOVE_SPEED

        this.velocity.y += GRAVITY * deltaTime

        this.position.x += this.velocity.x * deltaTime
        this.position.y += this.velocity.y * deltaTime
        this.position.z += this.velocity.z * deltaTime

        if (this.position.y <= GROUND_Y) {
            this.position.y = GROUND_Y
            this.velocity.y = 0
            this.onGround = true
        }
    }

}
