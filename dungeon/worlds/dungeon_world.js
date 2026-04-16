import World from '../../game/world.js'
import Player from '../entities/player.js'


export default class DungeonWorld extends World {

    constructor (options = {}) {
        super(options)
        this.addTagsIndex(['player'])
    }


    spawnPlayer (options = {}) {
        this.player = this.create(Player, {$bind: 'player', ...options})
        return this.player
    }

}
