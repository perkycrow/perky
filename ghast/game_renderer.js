import Group2D from '../render/group_2d.js'
import WorldView from '../game/world_view.js'
import PerkyModule from '../core/perky_module.js'

import Player from './player.js'
import PlayerView from './views/player_view.js'


export default class GameRenderer extends PerkyModule {

    constructor (options = {}) {
        super(options)
        this.world = options.world
        this.game = options.game

        this.entitiesGroup = new Group2D({name: 'entities'})

        this.worldView = this.create(WorldView, {
            $id: 'worldView',
            world: this.world,
            game: this.game
        })

        this.#registerViews()
    }


    #registerViews () {
        this.worldView.register(Player, PlayerView)
    }


    onStart () {
        this.#setupRenderGroups()
    }


    #setupRenderGroups () {
        const gameLayer = this.game.getCanvas('game')

        this.entitiesGroup.addChild(this.worldView.rootGroup)

        gameLayer.renderer.setRenderGroups([
            {
                $name: 'entities',
                content: this.entitiesGroup
            }
        ])
    }


    render () {
        const deltaTime = this.game.clock?.deltaTime ?? 0.016

        this.worldView.sync(deltaTime)

        const gameLayer = this.game.getCanvas('game')
        gameLayer.markDirty()
        gameLayer.render()
    }

}
