import Entity from '../../game/entity.js'


export default class ArsenalPanel extends Entity {

    constructor (options = {}) {
        super(options)
        this.skills = options.skills || []
    }

}
