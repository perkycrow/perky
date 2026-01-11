import EntityView from '../../game/entity_view.js'
import Circle from '../../render/circle.js'


export default class PlayerView extends EntityView {

    constructor (entity, context) {
        super(entity, context)

        this.root = new Circle({
            x: entity.x,
            y: entity.y,
            radius: 0.3,
            color: '#ffffff'
        })
    }

}
