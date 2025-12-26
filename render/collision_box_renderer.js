import EntityRenderer from './entity_renderer'
import Rectangle from './rectangle'


export default class CollisionBoxRenderer extends EntityRenderer {

    constructor (entity, context) {
        super(entity, context)

        const config = context.config || {}

        this.root = new Rectangle({
            x: entity.x,
            y: entity.y,
            width: config.width ?? 1,
            height: config.height ?? 1,
            color: 'transparent',
            strokeColor: config.strokeColor ?? '#ff0000',
            strokeWidth: config.strokeWidth ?? 2
        })
    }

}

