import Entity from '../game/entity.js'
import {CircleHitbox} from './collision_shapes.js'


export default class Projectile extends Entity {

    static $tags = ['projectile']

    constructor (params = {}) {
        super(params)

        const {
            velocityX = 6,
            velocityY = 2.5,
            gravity = -8,
            drag = 0.5,
            source = 'player',
            sprite = 'brick'
        } = params

        this.velocity.set(velocityX, velocityY)
        this.gravity = gravity
        this.drag = drag
        this.alive = true
        this.source = source
        this.sprite = sprite

        this.rotation = 0
        this.spinSpeed = -15

        this.hitbox = new CircleHitbox({
            radius: 0.15
        })
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

        if (this.position.y < -3 || this.position.x > 5 || this.position.x < -5) {
            this.alive = false
        }
    }

}
