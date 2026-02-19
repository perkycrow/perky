import EntityView from '../../game/entity_view.js'
import Sprite from '../../render/sprite.js'
import Easing from '../../math/easing.js'


const LERP_SPEED = 12
const DEPOP_DURATION = 0.35
const POP_DURATION = 0.3
const ABSORB_DURATION = 0.35


export default class ReagentView extends EntityView {

    #currentName = null
    #depopTimer = 0
    #popTimer = 0
    #absorbTimer = 0

    constructor (entity, context) {
        super(entity, context)

        this.spritesheet = context.game.getSpritesheet('reagents')
        this.#currentName = entity.name
        this.#depopTimer = 0
        this.#popTimer = 0
        this.#absorbTimer = 0

        const region = this.spritesheet?.getRegion(entity.name)

        this.root = new Sprite({
            x: entity.x,
            y: entity.y,
            width: 0.9,
            height: 0.9,
            region,
            visible: entity.active !== false
        })
    }


    update (deltaTime) {
        if (!this.root || !this.entity) {
            return
        }

        const t = Math.min(1, LERP_SPEED * deltaTime)
        this.root.x += (this.entity.x - this.root.x) * t
        this.root.y += (this.entity.y - this.root.y) * t

        if (this.#depopTimer > 0) {
            this.#updateDepop(deltaTime)
            return
        }

        if (this.#absorbTimer > 0) {
            this.#updateAbsorb(deltaTime)
            return
        }

        if (this.#popTimer > 0) {
            this.#updatePop(deltaTime)
        }
    }


    sync () {
        if (!this.root || !this.entity) {
            return
        }

        this.#syncVisibility()
        this.#syncAnimations()
    }


    #updateDepop (deltaTime) {
        this.#depopTimer -= deltaTime
        const progress = 1 - Math.max(0, this.#depopTimer / DEPOP_DURATION)
        const shrink = 1 - Easing.easeInCubic(progress)
        this.root.scaleX = shrink
        this.root.scaleY = shrink
        this.root.opacity = shrink
        this.root.rotation = Easing.easeInOutCubic(progress) * Math.PI
    }


    #updateAbsorb (deltaTime) {
        this.#absorbTimer -= deltaTime
        const progress = 1 - Math.max(0, this.#absorbTimer / ABSORB_DURATION)
        const grow = 1 + 0.5 * Easing.easeOutCubic(progress)
        const shake = (1 - progress) * 0.05 * Math.sin(progress * 30)
        this.root.scaleX = grow
        this.root.scaleY = grow
        this.root.rotation = shake
    }


    #updatePop (deltaTime) {
        this.#popTimer -= deltaTime
        const progress = 1 - Math.max(0, this.#popTimer / POP_DURATION)
        const scale = Easing.easeOutBack(progress)
        this.root.scaleX = scale
        this.root.scaleY = scale
    }


    #syncVisibility () {
        const wasVisible = this.root.visible
        this.root.visible = this.entity.active

        if (this.entity.active && !wasVisible) {
            this.root.x = this.entity.x
            this.root.y = this.entity.y
        }
    }


    #syncAnimations () {
        if (this.entity.merging && this.#depopTimer === 0) {
            this.#depopTimer = DEPOP_DURATION
        }

        if (this.entity.absorbing && this.#absorbTimer === 0) {
            this.#absorbTimer = ABSORB_DURATION
        }

        if (this.#currentName !== this.entity.name) {
            this.#currentName = this.entity.name
            this.root.region = this.spritesheet?.getRegion(this.#currentName)
            this.#absorbTimer = 0
            this.#popTimer = POP_DURATION
            this.root.scaleX = 0
            this.root.scaleY = 0
        }
    }

}
