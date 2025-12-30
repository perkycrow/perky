import World from '../game/world'


export default class DenWorld extends World {

    constructor (options = {}) {
        super(options)

        this.addTagsIndex(['updatable'])
        this.addTagsIndex(['enemy'])
        this.addTagsIndex(['projectile'])
    }

}
