import GhastView from './ghast_view.js'
import Sprite from '../../render/sprite.js'


export default class JarView extends GhastView {

    constructor (entity, context) {
        super(entity, context)

        const sprite = new Sprite({
            region: context.game.getRegion('jar'),
            x: entity.x,
            y: entity.y,
            width: 1,
            height: 1
        })

        this.initRoot(sprite)
    }

}
