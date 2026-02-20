import Entity from '../../game/entity.js'


export default class EndPanel extends Entity {

    constructor (options = {}) {
        super(options)
        this.state = options.state ?? null
        this.active = options.active ?? false
    }

}
