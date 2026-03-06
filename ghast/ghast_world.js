import World from '../game/world.js'
import Shade from './entities/shade.js'


export default class GhastWorld extends World {

    constructor (options = {}) {
        super(options)
    }


    preUpdate (deltaTime, context) {
        const direction = context.getDirection('move')
        if (this.shade) {
            this.shade.move(direction)
        }
    }


    spawnShade (options = {}) {
        return this.create(Shade, {
            $id: 'shade',
            $bind: 'shade',
            x: options.x || 0,
            y: options.y || 0
        })
    }

}
