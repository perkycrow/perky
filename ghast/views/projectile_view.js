import EntityView from '../../game/entity_view.js'
import Circle from '../../render/circle.js'


const teamColors = {
    shadow: '#7733cc',
    light: '#cc3333'
}


export default class ProjectileView extends EntityView {

    constructor (entity, context) {
        super(entity, context)

        const color = teamColors[entity.team] || '#ffffff'

        this.root = new Circle({
            x: entity.x,
            y: entity.y,
            radius: 0.08,
            color
        })
    }


    sync () {
        if (!this.root) {
            return
        }

        this.root.x = this.entity.x
        this.root.y = this.entity.y
        this.root.setDepth(-this.entity.y)
    }

}
