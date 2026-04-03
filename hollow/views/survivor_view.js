import EntityView from '../../game/entity_view.js'
import Group2D from '../../render/group_2d.js'
import Circle from '../../render/circle.js'
import Rectangle from '../../render/rectangle.js'


const PLAYER_COLORS = ['#4488ff', '#ff4444', '#44cc44', '#ffaa00']
const DIRECTION_COLOR = '#dddddd'
const DIRECTION_LENGTH = 0.2
const DIRECTION_WIDTH = 0.08


export default class SurvivorView extends EntityView {

    constructor (entity, context) {
        super(entity, context)

        const colorIndex = entity.colorIndex ?? 0
        const color = PLAYER_COLORS[colorIndex % PLAYER_COLORS.length]

        this.root = new Group2D({
            x: entity.x,
            y: entity.y
        })

        this.body = new Circle({
            radius: entity.bodyRadius,
            color
        })

        this.direction = new Rectangle({
            x: entity.bodyRadius,
            y: 0,
            width: DIRECTION_LENGTH,
            height: DIRECTION_WIDTH,
            color: DIRECTION_COLOR,
            anchorY: 0.5
        })

        this.root.addChild(this.body)
        this.root.addChild(this.direction)
    }


    sync () {
        super.sync()

        const {x, y} = this.entity.moveDirection

        if (x !== 0 || y !== 0) {
            const angle = Math.atan2(y, x)
            this.direction.x = Math.cos(angle) * this.entity.bodyRadius
            this.direction.y = Math.sin(angle) * this.entity.bodyRadius
            this.direction.rotation = angle
            this.direction.visible = true
        } else {
            this.direction.visible = false
        }
    }

}
