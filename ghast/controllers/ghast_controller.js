import GameController from '../../game/game_controller.js'


export default class GhastController extends GameController {

    static bindings = {
        moveUp: ['KeyW', 'ArrowUp', 'swipeUp'],
        moveDown: ['KeyS', 'ArrowDown', 'swipeDown'],
        moveLeft: ['KeyA', 'ArrowLeft', 'swipeLeft'],
        moveRight: ['KeyD', 'ArrowRight', 'swipeRight']
    }

    spawnShade (options = {}) {
        return this.world.spawnShade(options)
    }

}
