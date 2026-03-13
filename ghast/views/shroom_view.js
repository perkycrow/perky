import EntityView from '../../game/entity_view.js'
import Sprite from '../../render/sprite.js'
import {SPORE_DEFINITIONS} from '../spores/index.js'


export default class ShroomView extends EntityView {

    constructor (entity, context) {
        super(entity, context)

        const sprite = new Sprite({
            region: context.game.getRegion('shroom'),
            x: entity.x,
            y: entity.y,
            width: 1,
            height: 1
        })

        const color = SPORE_DEFINITIONS[entity.sporeType]?.color || '#ffffff'
        sprite.tint = hexToTint(color)

        this.root = sprite
    }


    sync () {
        if (!this.root) {
            return
        }

        this.root.x = this.entity.x
        this.root.y = this.entity.y
        this.root.setDepth(-this.entity.y)
        this.root.opacity = this.entity.depleted ? 0.3 : 1
    }

}


function hexToTint (hex) {
    const r = parseInt(hex.slice(1, 3), 16) / 255
    const g = parseInt(hex.slice(3, 5), 16) / 255
    const b = parseInt(hex.slice(5, 7), 16) / 255
    return [r, g, b, 0.5]
}
