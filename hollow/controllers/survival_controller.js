import GameController from '../../game/game_controller.js'


export default class SurvivalController extends GameController {

    static bindings = {
        moveLeft: ['KeyA', 'ArrowLeft'],
        moveRight: ['KeyD', 'ArrowRight'],
        moveUp: ['KeyW', 'ArrowUp'],
        moveDown: ['KeyS', 'ArrowDown']
    }

    static resources = ['world']

}
