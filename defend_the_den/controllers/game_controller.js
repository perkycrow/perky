import ActionController from '../../core/action_controller'
import Player from '../player'
import Projectile from '../projectile'
import Enemy from '../enemy'

export default class GameController extends ActionController {

    static bindings = {
        moveUp: ['KeyW', 'ArrowUp'],
        moveDown: ['KeyS', 'ArrowDown'],
        shoot: 'Space'
    }

    update (game, deltaTime) {
        const player = game.world.getEntity('player')

        const direction = game.getDirection('move')
        player.move(direction, deltaTime)

        const updatables = game.world.byTag('updatable')
        for (const entity of updatables) {
            entity.update(deltaTime)
        }

        const projectiles = game.world.byCategory('projectile')
        for (const entity of projectiles) {
            if (!entity.alive) {
                game.world.removeEntity(entity.$id)
            }
        }
    }

    shoot () {
        const player = this.engine.world.getEntity('player')

        const projectile = new Projectile({
            x: player.x + 0.5,
            y: player.y,
            speed: 8
        })

        const id = `projectile_${Date.now()}_${Math.random()}`
        projectile.$id = id
        projectile.$category = 'projectile'
        projectile.$tags = ['updatable']

        this.engine.world.addEntity(id, projectile)
    }

}