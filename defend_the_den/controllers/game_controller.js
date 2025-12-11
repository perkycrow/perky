import ActionController from '../../core/action_controller'


export default class GameController extends ActionController {


    move (direction, deltaTime) {

    }

    moveUp () {

    }

    moveDown () {

    }

    stopMove () {

    }

    shoot () {
        this.emit('shoot')
    }

}