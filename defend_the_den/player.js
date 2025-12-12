
import Vec2 from '../math/vec2'
import Entity from '../game/entity'


export default class Player extends Entity {

    constructor (params = {}) {
        super(params)

        const {x = 0, y = 0, maxSpeed = 8, acceleration = 80, boundaries = {min: -1.5, max: 1}} = params

        this.position = new Vec2(x, y)
        this.velocity = new Vec2(0, 0)

        this.maxSpeed = maxSpeed
        this.acceleration = acceleration
        this.boundaries = boundaries
    }


    get x () {
        return this.position.x
    }

    set x (value) {
        this.position.x = value
    }

    get y () {
        return this.position.y
    }

    set y (value) {
        this.position.y = value
    }


    move (direction, deltaTime) {
        if (direction.length() > 0) {
            const accel = direction.clone().multiplyScalar(this.acceleration * deltaTime)
            this.velocity.add(accel)
        } else {
            this.velocity.multiplyScalar(Math.pow(0.01, deltaTime * 60))
        }

        if (this.velocity.length() > this.maxSpeed) {
            this.velocity.normalize().multiplyScalar(this.maxSpeed)
        }
    }


    update (deltaTime) {
        if (this.velocity.length() < 0.01) {
            this.velocity.set(0, 0)
        }

        this.position.add(this.velocity.clone().multiplyScalar(deltaTime))

        if (this.position.y > this.boundaries.max) {
            this.position.y = this.boundaries.max
            this.velocity.y = 0
        } else if (this.position.y < this.boundaries.min) {
            this.position.y = this.boundaries.min
            this.velocity.y = 0
        }
    }

}
