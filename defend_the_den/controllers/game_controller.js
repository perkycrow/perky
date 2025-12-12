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

    start () {
        this.player = new Player({x: -2.5, y: 0})
        this.enemy = new Enemy({x: 2.5, y: 0, maxSpeed: 2})
        this.projectiles = []
    }

    move (direction, deltaTime) {

    }

    moveUp () {

    }

    moveDown () {

    }

    stopMove () {

    }

    shoot () {
        const projectile = new Projectile({
            x: this.player.x + 0.5,
            y: this.player.y,
            speed: 8
        })
        this.projectiles.push(projectile)
    }

}