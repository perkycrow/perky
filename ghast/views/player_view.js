import EntityView from '../../game/entity_view.js'
import Sprite from '../../render/sprite.js'


export default class PlayerView extends EntityView {

    constructor (entity, context) {
        super(entity, context)

        this.root = new Sprite({
            region: context.game.getRegion('shade'),
            x: entity.x,
            y: entity.y,
            width: 1,
            height: 1
        })
    }

}
