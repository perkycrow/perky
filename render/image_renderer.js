import EntityRenderer from './entity_renderer'
import Image2D from './image_2d'


export default class ImageRenderer extends EntityRenderer {

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

