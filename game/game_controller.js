import ActionController from '../core/action_controller.js'


export default class GameController extends ActionController {

    static resources = ['world', 'renderer', 'camera']

    get game () {
        return this.engine
    }


    spawn (Entity, options = {}) {
        return this.world?.create(Entity, options)
    }

}
