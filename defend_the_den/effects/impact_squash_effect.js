import SpriteEffect from '../../render/sprite_effects/sprite_effect.js'
import Easing from '../../math/easing.js'


export default class ImpactSquashEffect extends SpriteEffect {

    static type = 'impact_squash'

    constructor (options = {}) {
        super(options)

        this.duration = options.duration ?? 0.25
        this.intensity = options.intensity ?? 0.4
        this.impactDirection = options.impactDirection ?? {x: 1, y: 0}

        this.timer = 0
        this.active = false
    }


    trigger (impactDirection = {x: 1, y: 0}) {
        this.impactDirection = impactDirection
        this.timer = this.duration
        this.active = true
    }


    update (deltaTime) {
        if (!this.active) {
            return
        }

        this.timer -= deltaTime

        if (this.timer <= 0) {
            this.timer = 0
            this.active = false
        }
    }


    getHints () {
        if (!this.active) {
            return null
        }

        const progress = 1 - (this.timer / this.duration)
        const eased = Easing.easeOutElastic(progress)
        const squashAmount = (1 - eased) * this.intensity

        const dirX = Math.abs(this.impactDirection.x)
        const dirY = Math.abs(this.impactDirection.y)
        const isHorizontal = dirX > dirY

        if (isHorizontal) {
            return {
                scaleX: 1 - squashAmount,
                scaleY: 1 + squashAmount * 0.5
            }
        }

        return {
            scaleX: 1 + squashAmount * 0.5,
            scaleY: 1 - squashAmount
        }
    }

}
