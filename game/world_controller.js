import ActionController from '../core/action_controller.js'


export default class WorldController extends ActionController {

    #world = null


    get world () {
        return this.#world
    }


    set world (newWorld) {
        const oldWorld = this.#world

        if (oldWorld && oldWorld !== newWorld) {
            this.emit('world:delete', oldWorld)
        }

        this.#world = newWorld

        if (newWorld) {
            this.emit('world:set', newWorld)
        }
    }


    spawn (Entity, options = {}) {
        if (this.world) {
            return this.world.create(Entity, options)
        }

        return null
    }

}
