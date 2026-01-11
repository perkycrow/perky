import WorldController from '../../game/world_controller.js'


export default class GameController extends WorldController {

    static bindings = {
        moveUp: ['KeyW', 'ArrowUp'],
        moveDown: ['KeyS', 'ArrowDown'],
        moveLeft: ['KeyA', 'ArrowLeft'],
        moveRight: ['KeyD', 'ArrowRight']
    }


    update (game, deltaTime) {
        this.world.update(deltaTime, game)
    }


    spawnPlayer (options = {}) {
        return this.world.spawnPlayer(options)
    }

}
