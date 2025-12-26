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


WorldRenderer.register(Player, PlayerRenderer)
WorldRenderer.register(Enemy, ImageRenderer, {image: 'pig', width: 1, height: 1})
WorldRenderer.register(Projectile, CircleRenderer, {radius: 0.1, color: '#000000'})
WorldRenderer.register(Snowman, SnowmanRenderer)

WorldRenderer.register(
    (entity) => entity.hasTag('enemy'),
    CollisionBoxRenderer,
    {width: 0.8, height: 0.8, strokeColor: '#ff0000', strokeWidth: 0.05}
)


export default class GameRenderer extends PerkyModule {

    constructor (options = {}) {
        super(options)
        this.world = options.world
        this.game = options.game

        this.rootGroup = new Group2D({name: 'root'})

        this.worldRenderer = this.create(WorldRenderer, {
            $id: 'worldRenderer',
            world: this.world,
            game: this.game
        })
    }


    onStart () {
        this.#buildScene()
        this.rootGroup.addChild(this.worldRenderer.rootGroup)
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

        this.rootGroup.addChild(background)
    }


    render () {
        this.worldRenderer.sync()

        const gameLayer = this.game.getCanvas('game')
        gameLayer.setContent(this.rootGroup)
        gameLayer.render()
    }

}
