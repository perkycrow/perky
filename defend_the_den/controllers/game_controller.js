import WorldController from '../../game/world_controller'
import Player from '../player'
import Projectile from '../projectile'
import Enemy from '../enemy'


export default class GameController extends WorldController {

    static bindings = {
        moveUp: ['KeyW', 'ArrowUp'],
        moveDown: ['KeyS', 'ArrowDown'],
        shoot: 'Space'
    }


    update (game, deltaTime) {
        const player = this.world.getChild('player')

        const direction = game.getDirection('move')
        player.move(direction, deltaTime)

        const updatables = this.world.childrenByTags('updatable')
        for (const entity of updatables) {
            entity.update(deltaTime)
        }

        const projectiles = this.world.childrenByCategory('projectile')
        for (const entity of projectiles) {
            if (!entity.alive) {
                this.world.removeChild(entity.$name)
            }
        }
    }


    shoot () {
        const player = this.world.getChild('player')

        this.world.create(Projectile, {
            $category: 'projectile',
            $tags: ['updatable'],
            x: player.x + 0.5,
            y: player.y,
            speed: 8
        })
    }


    spawnPlayer (options = {}) {
        return this.execute('spawn', Player, {
            $name: 'player',
            $category: 'entity',
            $tags: ['updatable', 'controllable', 'player'],
            x: options.x || 0,
            y: options.y || 0
        })
    }


    spawnEnemy (options = {}) {
        return this.execute('spawn', Enemy, {
            $category: 'entity',
            $tags: ['updatable', 'enemy'],
            x: options.x || 0,
            y: options.y || 0,
            maxSpeed: options.maxSpeed || 2
        })
    }

}

