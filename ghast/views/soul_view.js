import GhastView from './ghast_view.js'
import Sprite from '../../render/sprite.js'


export default class SoulView extends GhastView {

    constructor (entity, context) {
        super(entity, context)

        const sprite = new Sprite({
            region: context.game.getRegion('soul'),
            x: entity.x,
            y: entity.y,
            width: 1,
            height: 1
        })

        this.initRoot(sprite)
    }

}
