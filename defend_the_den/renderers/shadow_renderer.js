import EntityRenderer from '../../render/entity_renderer'
import Circle from '../../render/circle'


export default class ShadowRenderer extends EntityRenderer {

    constructor (entity, context) {
        super(entity, context)

        const config = context.config || {}

        this.root = new Circle({
            x: entity.x,
            y: entity.y - 0.3,
            radius: config.radius ?? 0.3,
            color: config.color ?? 'rgba(0,0,0,0.3)',
            scaleY: 0.4
        })
    }


    sync () {
        if (this.root) {
            this.root.x = this.entity.x
            this.root.y = this.entity.y - 0.3
        }
    }

}

