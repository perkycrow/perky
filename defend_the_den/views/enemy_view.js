import EntityView from '../../game/entity_view.js'
import Image2D from '../../render/image_2d.js'


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
            anchorY: config.anchorY ?? 0.5
        })
    }


    sync () {
        if (!this.root) {
            return
        }

        this.root.x = this.entity.x
        this.root.y = this.entity.y

        if (this.entity.hitFlashTimer > 0) {
            const flashIntensity = this.entity.hitFlashTimer / this.entity.hitFlashDuration
            this.root.tint = [1, 0.2, 0.2, flashIntensity * 0.7]
        } else {
            this.root.tint = null
        }

        if (this.entity.isStunned) {
            const shake = Math.sin(Date.now() * 0.05) * 0.02
            this.root.x += shake
        }
    }

}
