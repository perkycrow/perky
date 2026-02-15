import EntityView from '../../game/entity_view.js'
import Rectangle from '../../render/rectangle.js'


export default class ReagentView extends EntityView {

    constructor (entity, context) {
        super(entity, context)
        this.root = new Rectangle({
            x: entity.x,
            y: entity.y,
            width: 0.9,
            height: 0.9,
            color: entity.color,
            visible: entity.active !== false
        })
    }


    sync () {
        if (this.root && this.entity) {
            this.root.x = this.entity.x
            this.root.y = this.entity.y
            this.root.color = this.entity.color
            this.root.visible = this.entity.active
        }
    }

}
