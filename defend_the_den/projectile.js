
import Vec2 from '../math/vec2'
import Entity from '../game/entity'


export default class Projectile extends Entity {

    constructor (params = {}) {
        super(params)

        const {x = 0, y = 0, speed = 10} = params

        this.position = new Vec2(x, y)
        this.velocity = new Vec2(speed, 0)
        this.speed = speed
        this.alive = true
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

        if (this.position.x > 5) {
            this.alive = false
        }
    }

}
