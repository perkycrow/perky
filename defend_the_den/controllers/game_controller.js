import ActionController from '../../core/action_controller'


export default class GameController extends ActionController {

    moveUp () {
        this.set('moving', 'up')
    }

    moveDown () {
        this.set('moving', 'down')
    }

    stopMove () {
        this.set('moving', null)
    }

    shoot () {
        console.log('Shoot')
    }

}