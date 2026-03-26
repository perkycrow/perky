import EntityView from './entity_view.js'
import Sprite from '../render/sprite.js'


export default class SpriteEntityView extends EntityView {

    constructor (entity, context) {
        super(entity, context)

        const texture = entity.options.texture
        const image = context.game?.getSource(texture)
        const region = image ? null : context.game?.getRegion(texture)

        this.root = new Sprite({
            x: entity.x,
            y: entity.y,
            image,
            region,
            width: entity.options.width ?? null,
            height: entity.options.height ?? null,
            depth: entity.options.depth ?? 0,
            opacity: entity.options.opacity ?? 1
        })
    }


    sync () {
        super.sync()

        if (this.root) {
            this.root.width = this.entity.options.width ?? null
            this.root.height = this.entity.options.height ?? null
            this.root.setDepth(this.entity.options.depth ?? 0)
            this.root.opacity = this.entity.options.opacity ?? 1
        }
    }

}
