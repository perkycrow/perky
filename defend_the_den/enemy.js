
import Vec2 from '../math/vec2'
import Entity from '../game/entity'


export default class Enemy extends Entity {

    constructor (params = {}) {
        super(params)

        const {x = 0, y = 0, maxSpeed = 3, boundaries = {min: -1.5, max: 1}} = params

        this.position = new Vec2(x, y)
        this.velocity = new Vec2(-maxSpeed, 0)  // Se déplace vers la gauche

        this.maxSpeed = maxSpeed
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


    update (deltaTime) {
        this.position.add(this.velocity.clone().multiplyScalar(deltaTime))

        if (this.position.y > this.boundaries.max) {
            this.position.y = this.boundaries.max
        } else if (this.position.y < this.boundaries.min) {
            this.position.y = this.boundaries.min
        }

        if (this.position.x < -4) {
            this.position.x = 4

            this.position.y = this.boundaries.min + Math.random() * (this.boundaries.max - this.boundaries.min)
        }
    }

}
