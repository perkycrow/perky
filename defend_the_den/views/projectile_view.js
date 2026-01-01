import EntityView from '../../game/entity_view.js'
import Circle from '../../render/circle.js'


export default class ProjectileView extends EntityView {

    constructor (entity, context) {
        super(entity, context)

        const config = context.config || {}

        this.root = new Circle({
            x: entity.x,
            y: entity.y,
            radius: config.radius ?? 0.08,
            color: config.color ?? '#3a2a1a'
        })
    }


    sync () {
        if (this.root) {
            this.root.x = this.entity.x
            this.root.y = this.entity.y
            this.root.rotation = this.entity.rotation
        }
    }

}
