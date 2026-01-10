import EntityView from '../../game/entity_view.js'
import Circle from '../../render/circle.js'
import Sprite from '../../render/sprite.js'
import WaveEffect from '../effects/wave_effect.js'


const SOURCE_COLORS = {
    player: '#3a2a1a',
    enemy: '#cc3333'
}


export default class ProjectileView extends EntityView {

    constructor (entity, context) {
        super(entity, context)

        const config = context.config || {}
        const sprite = entity.sprite || config.image

        if (sprite) {
            const image = context.game.getSource(sprite)

            this.root = new Sprite({
                x: entity.x,
                y: entity.y,
                image,
                width: entity.size,
                height: entity.size,
                anchorX: 0.5,
                anchorY: 0.5
            })

            if (!entity.spin) {
                this.waveEffect = new WaveEffect({amplitude: 0.3})
                this.root.effects.add(this.waveEffect)
            }
        } else {
            const color = SOURCE_COLORS[entity.source] || config.color || '#3a2a1a'

            this.root = new Circle({
                x: entity.x,
                y: entity.y,
                radius: config.radius ?? 0.08,
                color
            })
        }
    }


    sync () {
        if (this.root) {
            this.root.x = this.entity.x
            this.root.y = this.entity.y

            if (this.entity.spin) {
                this.root.rotation = this.entity.rotation
            } else if (this.waveEffect) {
                this.waveEffect.phase = this.entity.time * 15
            }
        }
    }

}
