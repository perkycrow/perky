import EntityView from '../../game/entity_view'
import Image2D from '../../render/image_2d'


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
            height: 1
        })
    }


    sync () {
        super.sync()

        const velocity = this.entity.velocity

        if (Math.abs(velocity.y) > 0.1) {
            this.root.image = velocity.y > 0 ? this.images.up : this.images.down
        } else {
            this.root.image = this.images.right
        }
    }

}

