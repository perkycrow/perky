import ActionController from '../core/action_controller'


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
        const entity = new Entity(options)

        if (this.world) {
            this.world.addEntity(entity)
        }

        return entity
    }

}
