import GameController from '../../game/game_controller.js'


export default class GhastController extends GameController {

    static bindings = {
        moveUp: ['KeyW', 'ArrowUp', 'swipeUp'],
        moveDown: ['KeyS', 'ArrowDown', 'swipeDown'],
        moveLeft: ['KeyA', 'ArrowLeft', 'swipeLeft'],
        moveRight: ['KeyD', 'ArrowRight', 'swipeRight']
    }

    update (game, deltaTime) {
        this.world.update(deltaTime, game)
    }


    spawnPlayer (options = {}) {
        return this.world.spawnPlayer(options)
    }

}
