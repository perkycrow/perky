import Group2D from '../render/group_2d'
import Image2D from '../render/image_2d'
import WorldRenderer from '../render/world_renderer'
import ImageRenderer from '../render/image_renderer'
import CircleRenderer from '../render/circle_renderer'
import CollisionBoxRenderer from '../render/collision_box_renderer'
import PerkyModule from '../core/perky_module'

import Player from './player'
import Enemy from './enemy'
import Projectile from './projectile'
import Snowman from './snowman'

import PlayerRenderer from './renderers/player_renderer'
import SnowmanRenderer from './renderers/snowman_renderer'
import ShadowRenderer from './renderers/shadow_renderer'


export default class GameRenderer extends PerkyModule {

    constructor (options = {}) {
        super(options)
        this.world = options.world
        this.game = options.game

        this.rootGroup = new Group2D({name: 'root'})
        this.backgroundGroup = new Group2D({name: 'background'})
        this.shadowsGroup = new Group2D({name: 'shadows'})
        this.entitiesGroup = new Group2D({name: 'entities'})

        this.worldRenderer = this.create(WorldRenderer, {
            $id: 'worldRenderer',
            world: this.world,
            game: this.game
        })

        this.shadowsRenderer = this.create(WorldRenderer, {
            $id: 'shadowsRenderer',
            world: this.world,
            game: this.game
        })

        this.#registerRenderers()
    }


    #registerRenderers () {
        this.worldRenderer
            .register(Player, PlayerRenderer)
            .register(Enemy, ImageRenderer, {image: 'pig', width: 1, height: 1})
            .register(Projectile, CircleRenderer, {radius: 0.1, color: '#000000'})
            .register(Snowman, SnowmanRenderer)
            .register(
                (entity) => entity.hasTag('enemy'),
                CollisionBoxRenderer,
                {width: 0.8, height: 0.8, strokeColor: '#ff0000', strokeWidth: 0.05}
            )

        this.shadowsRenderer
            .register(
                (entity) => entity.hasTag('enemy'),
                ShadowRenderer,
                {radius: 0.35, color: 'rgba(0,0,0,0.25)'}
            )
    }


    onStart () {
        this.#buildScene()

        // Build scene hierarchy: background -> shadows -> entities
        this.rootGroup.addChild(this.backgroundGroup)
        this.rootGroup.addChild(this.shadowsGroup)
        this.rootGroup.addChild(this.entitiesGroup)

        this.shadowsGroup.addChild(this.shadowsRenderer.rootGroup)
        this.entitiesGroup.addChild(this.worldRenderer.rootGroup)
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
    }


    render () {
        this.shadowsRenderer.sync()
        this.worldRenderer.sync()

        const gameLayer = this.game.getCanvas('game')
        gameLayer.setContent(this.rootGroup)
        gameLayer.render()
    }

}
