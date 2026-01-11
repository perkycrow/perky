import Group2D from '../render/group_2d.js'
import WorldView from './world_view.js'
import PerkyModule from '../core/perky_module.js'


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

        this.registerViews()
    }


    onStart () {
        this.setupRenderGroups()
    }


    registerViews () {
        // Override in subclass to register entity views
    }


    setupRenderGroups () {
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
