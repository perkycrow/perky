import ActionController from '../../core/action_controller'
import Player from '../player'
import Projectile from '../projectile'
import Enemy from '../enemy'


export default class GameController extends ActionController {

    #world = null

    static bindings = {
        moveUp: ['KeyW', 'ArrowUp'],
        moveDown: ['KeyS', 'ArrowDown'],
        shoot: 'Space'
    }


    get world () {
        return this.#world
    }


    set world (value) {
        this.#world = value
    }


    update (game, deltaTime) {
        const player = this.world.getEntity('player')

        const direction = game.getDirection('move')
        player.move(direction, deltaTime)

        const updatables = this.world.byTag('updatable')
        for (const entity of updatables) {
            entity.update(deltaTime)
        }

        const projectiles = this.world.byCategory('projectile')
        for (const entity of projectiles) {
            if (!entity.alive) {
                this.world.removeEntity(entity.$id)
            }
        }
    }


    shoot () {
        const player = this.world.getEntity('player')

        const projectile = new Projectile({
            x: player.x + 0.5,
            y: player.y,
            speed: 8
        })

        const id = `projectile_${Date.now()}_${Math.random()}`
        projectile.$id = id
        projectile.$category = 'projectile'
        projectile.$tags = ['updatable']

        this.world.addEntity(id, projectile)
    }


    spawn (Entity, options = {}) {
        const entity = new Entity(options)
        this.world.addEntity(entity)

        return entity
    }


    spawnPlayer (options = {}) {
        return this.execute('spawn', Player, {
            x: options.x || 0,
            y: options.y || 0,
            $category: 'player',
            $tags: ['updatable', 'controllable']
        })
    }


    spawnEnemy (options = {}) {
        return this.execute('spawn', Enemy, {
            x: options.x || 0,
            y: options.y || 0,
            maxSpeed: options.maxSpeed || 2,
            $category: 'enemy',
            $tags: ['updatable']
        })
    }

}