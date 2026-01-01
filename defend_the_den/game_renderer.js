import Group2D from '../render/group_2d.js'
import Image2D from '../render/image_2d.js'
import WorldView from '../game/world_view.js'
import ImageView from '../game/image_view.js'
import CircleView from '../game/circle_view.js'
import PerkyModule from '../core/perky_module.js'
import {ShadowTransform} from '../render/transforms/index.js'

import Player from './player.js'
import Enemy from './enemy.js'
import Projectile from './projectile.js'

import PlayerView from './views/player_view.js'


export default class GameRenderer extends PerkyModule {

    constructor (options = {}) {
        super(options)
        this.world = options.world
        this.game = options.game

        this.backgroundGroup = new Group2D({name: 'background'})
        this.entitiesGroup = new Group2D({name: 'entities'})

        this.worldView = this.create(WorldView, {
            $id: 'worldView',
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
    }


    onStart () {
        this.#buildScene()
        this.#setupRenderGroups()
    }


    #buildScene () {
        const backgroundImage = this.game.getSource('background')
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
        this.entitiesGroup.addChild(this.worldView.rootGroup)
    }


    #setupRenderGroups () {
        const gameLayer = this.game.getCanvas('game')

        gameLayer.renderer.setRenderGroups([
            {
                $name: 'background',
                content: this.backgroundGroup
            },
            {
                $name: 'shadows',
                content: this.entitiesGroup,
                renderTransform: new ShadowTransform({
                    skewX: 0.1,
                    scaleY: -0.5,
                    offsetY: 0.06,
                    color: [0, 0, 0, 0.3]
                })
            },
            {
                $name: 'entities',
                content: this.entitiesGroup
            }
        ])
    }


    render () {
        this.worldView.sync()

        const gameLayer = this.game.getCanvas('game')
        gameLayer.markDirty()
        gameLayer.render()
    }

}
