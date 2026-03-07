import EntityView from '../../game/entity_view.js'
import OutlineEffect from '../../render/shaders/builtin/effects/outline_effect.js'


const teamColors = {
    shadow: [0.5, 0.2, 1.0],
    light: [1.0, 0.2, 0.2]
}

const DEATH_DURATION = 0.3
const LUNGE_DISTANCE = 0.25


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

        if (this.entity.dying > 0) {
            const t = Math.max(0, this.entity.dying / DEATH_DURATION)
            this.root.setScale(t)
            this.root.opacity = t
            if (this.outlineEffect) {
                this.outlineEffect.width = 0
            }
            return
        }

        this.root.setScale(1)
        this.root.opacity = 1

        this.#syncAttackLunge()

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


    #syncAttackLunge () {
        const entity = this.entity

        if (!entity.isAttacking?.()) {
            return
        }

        const comp = entity.components?.find(c => c.phase)

        if (!comp) {
            return
        }

        const dir = comp.attackDirection
        let offset = 0

        if (comp.phase === 'winding') {
            offset = -comp.attackProgress * LUNGE_DISTANCE * 0.3
        } else if (comp.phase === 'striking') {
            offset = (1 - comp.attackProgress) * LUNGE_DISTANCE
        }

        this.root.x += dir.x * offset
        this.root.y += dir.y * offset
    }

}
