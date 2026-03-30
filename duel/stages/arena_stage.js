import Stage from '../../game/stage.js'
import Group2D from '../../render/group_2d.js'
import Rectangle from '../../render/rectangle.js'

import DuelWorld from '../worlds/duel_world.js'
import DuelController from '../controllers/duel_controller.js'
import wiring from '../wiring.js'


const GROUND_COLOR = '#445544'
const GROUND_WIDTH = 14
const GROUND_HEIGHT = 0.3


export default class ArenaStage extends Stage {

    static $name = 'arena'
    static World = DuelWorld
    static ActionController = DuelController

    onStart () {
        wiring.registerViews(this)

        this.backgroundGroup = new Group2D()
        this.#buildArena()
        this.#setupRenderGroups()

        super.onStart()

        this.game.execute('spawnFencer1')
        this.game.execute('spawnFencer2')
    }


    update (deltaTime) {
        super.update(deltaTime)
        this.world.update(deltaTime, this.game)
    }


    render () {
        this.syncViews()
    }


    #buildArena () {
        const ground = new Rectangle({
            x: 0,
            y: -0.15,
            width: GROUND_WIDTH,
            height: GROUND_HEIGHT,
            color: GROUND_COLOR
        })

        this.backgroundGroup.addChild(ground)
    }


    #setupRenderGroups () {
        const gameRenderer = this.game.getRenderer('game')

        gameRenderer.setRenderGroups([
            {
                $name: 'background',
                content: this.backgroundGroup
            },
            {
                $name: 'entities',
                content: this.viewsGroup
            }
        ])
    }

}
