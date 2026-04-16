import GameController from '../../game/game_controller.js'


export default class PlayerController extends GameController {

    static bindings = {
        moveUp: ['KeyW'],
        moveDown: ['KeyS'],
        moveLeft: ['KeyA'],
        moveRight: ['KeyD'],
        jump: ['Space']
    }

    static resources = ['world']


    jump () {
        this.world.player?.jump()
    }

}
