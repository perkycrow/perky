import EntityView from '../../game/entity_view.js'
import Sprite from '../../render/sprite.js'


export default class SoulView extends EntityView {

    constructor (entity, context) {
        super(entity, context)

        this.root = new Sprite({
            region: context.game.getRegion('soul'),
            x: entity.x,
            y: entity.y,
            width: 1,
            height: 1
        })
    }

}
