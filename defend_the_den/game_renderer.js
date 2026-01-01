import Group2D from '../render/group_2d'
import Image2D from '../render/image_2d'
import WorldView from '../game/world_view'
import ImageView from '../game/image_view'
import CircleView from '../game/circle_view'
import PerkyModule from '../core/perky_module'
import {ShadowTransform} from '../render/transforms'

import Player from './player'
import Enemy from './enemy'
import Projectile from './projectile'

import PlayerView from './views/player_view'


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
