import Group2D from '../render/group_2d'
import Image2D from '../render/image_2d'
import WorldView from '../game/world_view'
import ImageView from '../render/image_view'
import CircleView from '../render/circle_view'
import CollisionBoxView from '../render/collision_box_view'
import PerkyModule from '../core/perky_module'

import Player from './player'
import Enemy from './enemy'
import Projectile from './projectile'
import Snowman from './snowman'

import PlayerView from './views/player_view'
import SnowmanView from './views/snowman_view'
import ShadowView from './views/shadow_view'


export default class GameRenderer extends PerkyModule {

    constructor (options = {}) {
        super(options)
        this.world = options.world
        this.game = options.game

        // Scene graph groups (content for each render layer)
        this.backgroundGroup = new Group2D({name: 'background'})
        this.shadowsGroup = new Group2D({name: 'shadows'})
        this.entitiesGroup = new Group2D({name: 'entities'})

        // World view for entities
        this.worldView = this.create(WorldView, {
            $id: 'worldView',
            world: this.world,
            game: this.game
        })

        // Shadow view for enemy shadows
        this.shadowsView = this.create(WorldView, {
            $id: 'shadowsView',
            world: this.world,
            game: this.game
        })

        this.#registerViews()
    }


    #registerViews () {
        this.worldView
            .register(Player, PlayerView)
            .register(Enemy, ImageView, {image: 'pig', width: 1, height: 1})
            .register(Projectile, CircleView, {radius: 0.1, color: '#000000'})
            .register(Snowman, SnowmanView)
            .register(
                (entity) => entity.hasTag('enemy'),
                CollisionBoxView,
                {width: 0.8, height: 0.8, strokeColor: '#ff0000', strokeWidth: 0.05}
            )

        // Shadow view only for enemies
        this.shadowsView
            .register(
                (entity) => entity.hasTag('enemy'),
                ShadowView,
                {radius: 0.35, color: 'rgba(0,0,0,0.25)'}
            )
    }


    onStart () {
        this.#buildScene()
        this.#setupRenderGroups()
    }


    #buildScene () {
        const backgroundImage = this.game.getImage('background')
        const backgroundHeight = 5
        const backgroundWidth = (backgroundImage.width / backgroundImage.height) * backgroundHeight

        const background = new Image2D({
            image: backgroundImage,
            x: 0,
            y: 0,
            width: backgroundWidth,
            height: backgroundHeight
        })

        this.backgroundGroup.addChild(background)

        // Link views to their groups
        this.shadowsGroup.addChild(this.shadowsView.rootGroup)
        this.entitiesGroup.addChild(this.worldView.rootGroup)
    }


    #setupRenderGroups () {
        const gameLayer = this.game.getCanvas('game')

        // Configure render groups - each with its own framebuffer
        // No per-group effects for now, but structure is ready
        gameLayer.renderer.setRenderGroups([
            {
                $name: 'background',
                content: this.backgroundGroup
            },
            {
                $name: 'shadows',
                content: this.shadowsGroup
            },
            {
                $name: 'entities',
                content: this.entitiesGroup

                // Could add per-entity effects here, e.g.:
                // postPasses: [saturationPass]
            }
        ])
    }


    render () {
        this.shadowsView.sync()
        this.worldView.sync()

        const gameLayer = this.game.getCanvas('game')
        gameLayer.markDirty()  // Mark dirty to trigger re-render
        gameLayer.render()
    }

}
