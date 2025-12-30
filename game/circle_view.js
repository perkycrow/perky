import EntityView from './entity_view'
import Circle from '../render/circle'


export default class CircleView extends EntityView {

    constructor (entity, context) {
        super(entity, context)

        const config = context.config || {}

        this.root = new Circle({
            x: entity.x,
            y: entity.y,
            radius: config.radius ?? 0.5,
            color: config.color ?? '#ffffff'
        })
    }

}
