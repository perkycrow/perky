import Entity from '../../game/entity.js'


export default class LabPanel extends Entity {

    constructor (options = {}) {
        super(options)
        this.reagentNames = options.reagentNames || []
        this.unlockedCount = options.unlockedCount || 0
    }

}
