import EntityView from '../../game/entity_view.js'
import Group2D from '../../render/group_2d.js'
import Sprite from '../../render/sprite.js'


export default class BoardView extends EntityView {

    constructor (entity, context) {
        super(entity, context)

        this.root = new Group2D({x: entity.x, y: entity.y})

        const frameImage = context.game.getSource('boardFrame')

        if (frameImage) {
            this.root.addChild(new Sprite({
                image: frameImage,
                x: 3,
                y: 4.5,
                width: 8,
                depth: -1
            }))
        }
    }

}
