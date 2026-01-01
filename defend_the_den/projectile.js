import Entity from '../game/entity.js'


export default class Projectile extends Entity {

    static $tags = ['projectile']

    constructor (params = {}) {
        super(params)

        const {
            velocityX = 5,
            velocityY = 3,
            gravity = -10,
            drag = 0.5
        } = params

        this.velocity.set(velocityX, velocityY)
        this.gravity = gravity
        this.drag = drag
        this.alive = true

        this.rotation = 0
        this.spinSpeed = 15
    }


    update (deltaTime) {
        this.velocity.y += this.gravity * deltaTime

        const speed = Math.sqrt(this.velocity.x ** 2 + this.velocity.y ** 2)
        const dragForce = this.drag * speed * deltaTime
        if (speed > 0.1) {
            this.velocity.x -= (this.velocity.x / speed) * dragForce * 0.3
        }

        this.position.add(this.velocity.clone().multiplyScalar(deltaTime))

        this.rotation += this.spinSpeed * deltaTime

        if (this.position.y < -3 || this.position.x > 5) {
            this.alive = false
        }
    }

}
