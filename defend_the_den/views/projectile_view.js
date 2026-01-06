import EntityView from '../../game/entity_view.js'
import Circle from '../../render/circle.js'
import Image2D from '../../render/image_2d.js'


const SOURCE_COLORS = {
    player: '#3a2a1a',
    enemy: '#cc3333'
}


export default class ProjectileView extends EntityView {

    constructor (entity, context) {
        super(entity, context)

        const config = context.config || {}

        if (config.image) {
            const image = context.game.getSource(config.image)

            this.root = new Image2D({
                x: entity.x,
                y: entity.y,
                image,
                width: config.width ?? 0.3,
                height: config.height ?? 0.3,
                anchorX: 0.5,
                anchorY: 0.5
            })
        } else {
            const color = SOURCE_COLORS[entity.source] || config.color || '#3a2a1a'

            this.root = new Circle({
                x: entity.x,
                y: entity.y,
                radius: config.radius ?? 0.08,
                color
            })
        }
    }


    sync () {
        if (this.root) {
            this.root.x = this.entity.x
            this.root.y = this.entity.y
            this.root.rotation = this.entity.rotation
        }
    }

}
