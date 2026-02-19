import GameController from '../../game/game_controller.js'


export default class ChapterController extends GameController {

    static bindings = {
        moveLeft:      ['ArrowLeft', 'KeyA'],
        moveRight:     ['ArrowRight', 'KeyD'],
        rotateCluster: ['ArrowUp', 'KeyW', 'Space'],
        dropCluster:   ['ArrowDown', 'KeyS']
    }

    moveLeft () {
        this.world.gameAction('moveCluster', 'left')
    }


    moveRight () {
        this.world.gameAction('moveCluster', 'right')
    }


    rotateCluster () {
        this.world.gameAction('rotateCluster')
    }


    dropCluster () {
        this.world.gameAction('dropCluster')
    }

}
