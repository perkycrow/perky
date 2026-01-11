import WorldController from '../../game/world_controller.js'


export default class GameController extends WorldController {

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
