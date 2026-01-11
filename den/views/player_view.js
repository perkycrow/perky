import EntityView from '../../game/entity_view.js'
import Sprite from '../../render/sprite.js'
import OutlineEffect from '../../render/sprite_effects/outline_effect.js'


export default class PlayerView extends EntityView {

    constructor (entity, context) {
        super(entity, context)

        this.regions = {
            right: context.game.getRegion('wolf_right'),
            up: context.game.getRegion('wolf_up'),
            down: context.game.getRegion('wolf_down')
        }

        this.root = new Sprite({
            region: this.regions.right,
            x: entity.x,
            y: entity.y,
            width: 1,
            height: 1,
            anchorY: 0.05
        })


        this.root.effects.add(new OutlineEffect({
            width: 0.03,
            color: [1, 1, 0, 1]
        }))
    }


    sync () {
        super.sync()

        const velocity = this.entity.velocity

        if (Math.abs(velocity.y) > 0.1) {
            this.root.region = velocity.y > 0 ? this.regions.up : this.regions.down
        } else {
            this.root.region = this.regions.right
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
