import EntityView from '../../game/entity_view.js'
import Group2D from '../../render/group_2d.js'
import Circle from '../../render/circle.js'
import Rectangle from '../../render/rectangle.js'


const PLAYER_1_COLOR = '#4488ff'
const PLAYER_2_COLOR = '#ff4444'
const SWORD_COLOR = '#dddddd'
const STUN_COLOR = '#666666'
const BODY_CENTER_Y = 0.3


export default class FencerView extends EntityView {

    constructor (entity, context) {
        super(entity, context)

        const isPlayer1 = entity.$id === 'fencer1'
        const color = isPlayer1 ? PLAYER_1_COLOR : PLAYER_2_COLOR

        this.root = new Group2D({
            x: entity.x,
            y: entity.y
        })

        this.body = new Circle({
            x: 0,
            y: BODY_CENTER_Y,
            radius: entity.bodyRadius,
            color
        })

        this.sword = new Rectangle({
            x: entity.facing * entity.bodyRadius,
            y: BODY_CENTER_Y + swordOffsetY(entity.swordPosition),
            width: entity.swordLength,
            height: 0.06,
            color: SWORD_COLOR,
            anchorX: entity.facing === 1 ? 0 : 1,
            anchorY: 0.5
        })

        this.playerColor = color
        this.root.addChild(this.body)
        this.root.addChild(this.sword)
    }


    sync () {
        super.sync()

        const entity = this.entity

        this.sword.x = entity.facing * entity.bodyRadius
        this.sword.y = BODY_CENTER_Y + swordOffsetY(entity.swordPosition)
        this.sword.anchorX = entity.facing === 1 ? 0 : 1

        this.body.color = entity.stunned ? STUN_COLOR : this.playerColor

        if (entity.lunging) {
            this.body.scaleX = 1.15
            this.body.scaleY = 0.9
        } else {
            this.body.scaleX = 1
            this.body.scaleY = 1
        }
    }

}


function swordOffsetY (position) {
    if (position === 'high') {
        return 0.2
    }
    if (position === 'mid') {
        return 0
    }
    return -0.2
}
