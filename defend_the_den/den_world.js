import World from '../game/world'
import Player from './player'
import Projectile from './projectile'


export default class DenWorld extends World {

    constructor (options = {}) {
        super(options)

        this.addTagsIndex(['enemy'])
        this.addTagsIndex(['projectile'])
    }


    spawnPlayer (options = {}) {
        return this.create(Player, {
            $id: 'player',
            $bind: 'player',
            x: options.x || 0,
            y: options.y || 0
        })
    }


    spawnProjectile (options = {}) {
        return this.create(Projectile, {
            x: options.x || 0,
            y: options.y || 0,
            velocityX: options.velocityX || 12,
            velocityY: options.velocityY || 1,
            gravity: options.gravity || -8
        })
    }

}
