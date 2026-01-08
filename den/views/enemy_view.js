import EntityView from '../../game/entity_view.js'
import Image2D from '../../render/image_2d.js'
import ImpactSquashEffect from '../effects/impact_squash_effect.js'
import ChromaticEffect from '../effects/chromatic_effect.js'


export default class EnemyView extends EntityView {

    constructor (entity, context) {
        super(entity, context)

        const config = context.config || {}
        const image = context.game.getSource(config.image)

        this.baseScaleX = config.width ?? 1
        this.baseScaleY = config.height ?? 1

        this.root = new Image2D({
            image,
            x: entity.x,
            y: entity.y,
            width: this.baseScaleX,
            height: this.baseScaleY,
            anchorX: config.anchorX ?? 0.5,
            anchorY: config.anchorY ?? 0.05
        })

        this.impactSquash = new ImpactSquashEffect({
            duration: 0.4,
            intensity: 0.6
        })

        this.chromaticEffect = new ChromaticEffect({intensity: 0})
        this.root.effects.add(this.chromaticEffect)

        this.lastHp = entity.hp
    }


    sync (deltaTime = 0) {
        if (!this.root) {
            return
        }

        this.syncDamage(deltaTime)
        this.syncPosition()
        this.syncHitFlash()
        this.syncStun()
        this.syncSquash()
    }


    syncDamage (deltaTime) {
        if (this.entity.hp < this.lastHp) {
            this.impactSquash.trigger({x: 1, y: 0})
            this.lastHp = this.entity.hp
        }
        this.impactSquash.update(deltaTime)
    }


    syncPosition () {
        this.root.x = this.entity.x
        this.root.y = this.entity.y
        this.root.setDepth(-this.entity.y)
    }


    syncHitFlash () {
        if (this.entity.hitFlashTimer > 0) {
            const flashIntensity = this.entity.hitFlashTimer / this.entity.hitFlashDuration
            this.root.tint = [1, 0.2, 0.2, flashIntensity * 0.7]
            this.chromaticEffect.intensity = flashIntensity * 0.5
        } else {
            this.root.tint = null
            this.chromaticEffect.intensity = 0
        }
    }


    syncStun () {
        if (this.entity.isStunned) {
            const shake = Math.sin(Date.now() * 0.05) * 0.02
            this.root.x += shake
        }
    }


    syncSquash () {
        const squashHints = this.impactSquash.getHints()
        if (squashHints) {
            this.root.scaleX = this.baseScaleX * squashHints.scaleX
            this.root.scaleY = this.baseScaleY * squashHints.scaleY
        } else {
            this.root.scaleX = this.baseScaleX
            this.root.scaleY = this.baseScaleY
        }
    }

}
