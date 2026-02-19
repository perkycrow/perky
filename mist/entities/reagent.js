import Entity from '../../game/entity.js'


export default class Reagent extends Entity {

    constructor (options = {}) {
        super(options)
        this.name = options.name || ''
        this.order = options.order || 0
        this.active = options.active !== false
        this.merging = false
        this.absorbing = false
    }

}
