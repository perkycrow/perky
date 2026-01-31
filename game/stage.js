import PerkyModule from '../core/perky_module.js'
import WorldView from './world_view.js'


export default class Stage extends PerkyModule {

    static $category = 'stage'
    static World = null
    static WorldView = WorldView

    constructor (options = {}) {
        super(options)

        this.game = options.game

        this.#createWorld()
        this.#createWorldView()
    }


    #createWorld () {
        const WorldClass = this.constructor.World

        if (!WorldClass) {
            return
        }

        this.create(WorldClass, {$bind: 'world'})
    }


    #createWorldView () {
        const WorldViewClass = this.constructor.WorldView

        if (!this.world || !WorldViewClass) {
            return
        }

        this.create(WorldViewClass, {
            $bind: 'worldView',
            world: this.world,
            game: this.game
        })
    }


    update () {

    }


    render () {

    }

}
