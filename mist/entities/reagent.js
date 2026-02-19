import Entity from '../../game/entity.js'


export default class Reagent extends Entity {

    constructor (options = {}) {
        super(options)
        this.reagentName = options.reagentName || ''
        this.active = options.active !== false
    }

}
