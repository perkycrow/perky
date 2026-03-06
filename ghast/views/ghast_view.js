import EntityView from '../../game/entity_view.js'
import OutlineEffect from '../../render/shaders/builtin/effects/outline_effect.js'


const teamColors = {
    shadow: [0.5, 0.2, 1.0],
    light: [1.0, 0.2, 0.2]
}


export default class GhastView extends EntityView {

    constructor (entity, context) {
        super(entity, context)

        this.outlineEffect = null
        this.flashTimer = 0

        entity.on('damaged', () => {
            this.flashTimer = 0.15
        })
    }


    initRoot (sprite) {
        this.root = sprite

        this.outlineEffect = new OutlineEffect({
            width: 0,
            enabled: true
        })

        this.root.effects.add(this.outlineEffect)
    }


    sync () {
        if (!this.root) {
            return
        }

        this.root.x = this.entity.x
        this.root.y = this.entity.y
        this.root.setDepth(-this.entity.y)

        if (this.flashTimer > 0) {
            this.flashTimer -= 1 / 60
            this.root.tint = [1, 1, 1, 0.6]
        } else if (this.root.tint) {
            this.root.tint = null
        }

        if (this.outlineEffect) {
            const team = this.entity.team
            if (team) {
                if (this.flashTimer > 0) {
                    this.outlineEffect.width = 0.08
                    this.outlineEffect.color = [1, 1, 1]
                } else {
                    this.outlineEffect.width = 0.04
                    this.outlineEffect.color = teamColors[team] || [1, 1, 1]
                }
            } else {
                this.outlineEffect.width = 0
            }
        }
    }

}
