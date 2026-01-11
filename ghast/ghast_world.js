import World from '../game/world.js'
import Player from './player.js'


export default class GhastWorld extends World {

    constructor (options = {}) {
        super(options)
    }


    preUpdate (deltaTime, context) {
        const direction = context.getDirection('move')
        if (this.player) {
            this.player.move(direction)
        }
    }


    spawnPlayer (options = {}) {
        return this.create(Player, {
            $id: 'player',
            $bind: 'player',
            x: options.x || 0,
            y: options.y || 0
        })
    }

}
