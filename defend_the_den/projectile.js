import Entity from '../game/entity'


export default class Projectile extends Entity {

    static $tags = ['projectile']

    constructor (params = {}) {
        super(params)

        const {velocityX = 5, velocityY = 3, gravity = -10} = params

        this.velocity.set(velocityX, velocityY)
        this.gravity = gravity
        this.alive = true
    }


    update (deltaTime) {
        this.velocity.y += this.gravity * deltaTime

        this.position.add(this.velocity.clone().multiplyScalar(deltaTime))

        if (this.position.y < -3 || this.position.x > 5) {
            this.alive = false
        }
    }

}
