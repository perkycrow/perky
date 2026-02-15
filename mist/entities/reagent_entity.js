import Entity from '../../game/entity.js'


export default class ReagentEntity extends Entity {

    constructor (options = {}) {
        super(options)
        this.reagentName = options.reagentName || ''
        this.color = options.color || '#666666'
        this.active = options.active !== false
    }

}
