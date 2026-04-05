import Entity from '../../game/entity.js'
import Hitbox from '../../game/hitbox.js'
import Velocity from '../../game/velocity.js'


export default class Projectile extends Entity {

    constructor (params = {}) {
        const {
            speed = 6,
            dirX = 1,
            dirY = 0,
            ttl = 3,
            hitRadius = 0.15,
            faction = null,
            source = null,
            damage = 1
        } = params

        super(params)

        this.create(Hitbox, {radius: hitRadius})
        this.create(Velocity, {x: dirX * speed, y: dirY * speed})

        this.faction = faction
        this.source = source
        this.damage = damage
        this.alive = true
        this.ttl = ttl
        this.time = 0
    }


    update (deltaTime) {
        this.applyVelocity(deltaTime)
        this.time += deltaTime

        if (this.time >= this.ttl) {
            this.alive = false
        }
    }

}
