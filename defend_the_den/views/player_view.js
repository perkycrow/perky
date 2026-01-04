import EntityView from '../../game/entity_view.js'
import Image2D from '../../render/image_2d.js'
import OutlineEffect from '../../render/sprite_effects/outline_effect.js'


export default class PlayerView extends EntityView {

    constructor (entity, context) {
        super(entity, context)

        this.images = {
            right: context.game.getSource('wolf_right'),
            up: context.game.getSource('wolf_up'),
            down: context.game.getSource('wolf_down')
        }

        this.root = new Image2D({
            image: this.images.right,
            x: entity.x,
            y: entity.y,
            width: 1,
            height: 1,
            anchorY: 0.05
        })

        this.root.showDebugGizmos()

        this.root.effects.add(new OutlineEffect({
            width: 0.03,
            color: [1, 1, 0, 1]
        }))
    }


    sync () {
        super.sync()

        const velocity = this.entity.velocity

        if (Math.abs(velocity.y) > 0.1) {
            this.root.image = velocity.y > 0 ? this.images.up : this.images.down
        } else {
            this.root.image = this.images.right
        }

        if (this.entity.shootRecoilTimer > 0) {
            const t = this.entity.shootRecoilTimer / this.entity.shootRecoilDuration
            this.root.scaleX = 1 - t * 0.08
            this.root.scaleY = 1 + t * 0.05
        } else {
            this.root.scaleX = 1
            this.root.scaleY = 1
        }
    }

}
