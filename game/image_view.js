import EntityView from './entity_view'
import Image2D from '../render/image_2d'


export default class ImageView extends EntityView {

    constructor (entity, context) {
        super(entity, context)

        const config = context.config || {}
        const image = context.game.getImage(config.image)

        this.root = new Image2D({
            image,
            x: entity.x,
            y: entity.y,
            width: config.width ?? 1,
            height: config.height ?? 1,
            anchorX: config.anchorX ?? 0.5,
            anchorY: config.anchorY ?? 0.5
        })
    }

}
