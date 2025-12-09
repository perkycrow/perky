import ActionController from '../../core/action_controller'


export default class GameController extends ActionController {


    move (direction, deltaTime) {
        this.get('player').y += direction.y * 3 * deltaTime
    }

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
        console.log('Shoot', Date.now())
        this.emit('shoot')
    }

}