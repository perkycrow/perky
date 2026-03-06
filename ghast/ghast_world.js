import World from '../game/world.js'
import Shade from './entities/shade.js'
import Skeleton from './entities/skeleton.js'
import Rat from './entities/rat.js'
import Inquisitor from './entities/inquisitor.js'
import Soul from './entities/soul.js'
import Cage from './entities/cage.js'
import Turret from './entities/turret.js'
import Jar from './entities/jar.js'


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


    spawnSkeleton (options = {}) {
        return this.create(Skeleton, {
            x: options.x || 0,
            y: options.y || 0
        })
    }


    spawnRat (options = {}) {
        return this.create(Rat, {
            x: options.x || 0,
            y: options.y || 0
        })
    }


    spawnInquisitor (options = {}) {
        return this.create(Inquisitor, {
            x: options.x || 0,
            y: options.y || 0
        })
    }


    spawnSoul (options = {}) {
        return this.create(Soul, {
            x: options.x || 0,
            y: options.y || 0
        })
    }


    spawnCage (options = {}) {
        return this.create(Cage, {
            x: options.x || 0,
            y: options.y || 0
        })
    }


    spawnTurret (options = {}) {
        return this.create(Turret, {
            x: options.x || 0,
            y: options.y || 0
        })
    }


    spawnJar (options = {}) {
        return this.create(Jar, {
            x: options.x || 0,
            y: options.y || 0
        })
    }

}
