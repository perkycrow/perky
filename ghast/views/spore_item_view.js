import EntityView from '../../game/entity_view.js'
import Circle from '../../render/circle.js'


const ITEM_RADIUS = 0.15
const PULSE_SPEED = 2
const PULSE_AMOUNT = 0.03


export default class SporeItemView extends EntityView {

    constructor (entity, context) {
        super(entity, context)
        this.autoDepth = true

        this.root = new Circle({
            radius: ITEM_RADIUS,
            color: entity.sporeColor,
            x: entity.x,
            y: entity.y
        })

        this.time = Math.random() * Math.PI * 2
    }


    sync () {
        if (!this.root) {
            return
        }

        this.time += 1 / 60
        const pulse = Math.sin(this.time * PULSE_SPEED) * PULSE_AMOUNT

        this.root.x = this.entity.x
        this.root.y = this.entity.y
        this.root.radius = ITEM_RADIUS + pulse
        this.root.setDepth(-this.entity.y)
    }

}
