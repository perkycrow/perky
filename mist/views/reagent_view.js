import EntityView from '../../game/entity_view.js'
import Sprite from '../../render/sprite.js'


const LERP_SPEED = 12


export default class ReagentView extends EntityView {

    constructor (entity, context) {
        super(entity, context)

        this.spritesheet = context.game.getSpritesheet('reagents')
        this._currentName = entity.reagentName
        this._popTimer = 0

        const region = this.spritesheet?.getRegion(entity.reagentName)

        this.root = new Sprite({
            x: entity.x,
            y: entity.y,
            width: 0.9,
            height: 0.9,
            region,
            visible: entity.active !== false
        })
    }


    update (deltaTime) {
        if (!this.root || !this.entity) {
            return
        }

        const t = Math.min(1, LERP_SPEED * deltaTime)
        this.root.x += (this.entity.x - this.root.x) * t
        this.root.y += (this.entity.y - this.root.y) * t

        if (this._popTimer > 0) {
            this._popTimer -= deltaTime
            const p = Math.max(0, this._popTimer / 0.15)
            const s = 1 + p * 0.3
            this.root.scaleX = s
            this.root.scaleY = s
        }
    }


    sync () {
        if (!this.root || !this.entity) {
            return
        }

        const wasVisible = this.root.visible
        this.root.visible = this.entity.active

        if (this.entity.active && !wasVisible) {
            this.root.x = this.entity.x
            this.root.y = this.entity.y
        }

        if (this._currentName !== this.entity.reagentName) {
            this._currentName = this.entity.reagentName
            this.root.region = this.spritesheet?.getRegion(this._currentName)
            this._popTimer = 0.15
        }
    }

}
