import Entity from '../game/entity.js'


export default class Enemy extends Entity {

    static $tags = ['enemy']

    constructor (params = {}) {
        super(params)

        const {maxSpeed = 3, boundaries = {min: -1.5, max: 1}} = params

        this.velocity.set(-maxSpeed, 0)

        this.maxSpeed = maxSpeed
        this.boundaries = boundaries
        this.alive = true
    }


    update (deltaTime) {
        this.position.add(this.velocity.clone().multiplyScalar(deltaTime))

        if (this.position.y > this.boundaries.max) {
            this.position.y = this.boundaries.max
        } else if (this.position.y < this.boundaries.min) {
            this.position.y = this.boundaries.min
        }

        if (this.position.x < -2.5) {
            this.alive = false
        }
    }

}
