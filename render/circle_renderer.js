import EntityRenderer from './entity_renderer'
import Circle from './circle'


export default class CircleRenderer extends EntityRenderer {

    constructor (entity, context) {
        super(entity, context)

        const config = entity.constructor.renderable

        this.root = new Circle({
            x: entity.x,
            y: entity.y,
            radius: config.radius ?? 0.5,
            color: config.color ?? '#ffffff'
        })
    }

}

