import Group2D from '../render/group_2d.js'
import Image2D from '../render/image_2d.js'
import WorldView from '../game/world_view.js'
import PerkyModule from '../core/perky_module.js'
import {ShadowTransform} from '../render/transforms/index.js'

import Player from './player.js'
import Enemy from './enemy.js'
import Projectile from './projectile.js'

import PlayerView from './views/player_view.js'
import EnemyView from './views/enemy_view.js'
import ProjectileView from './views/projectile_view.js'
import ImpactParticles from './impact_particles.js'

import ChromaticEffect from './effects/chromatic_effect.js'
import OutlineEffect from '../render/shaders/builtin/effects/outline_effect.js'


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

        this.impactParticles = this.create(ImpactParticles, {
            $id: 'impactParticles',
            count: 8,
            minSpeed: 3,
            maxSpeed: 6,
            lifetime: 0.35
        })

        this.#registerViews()
    }


    #registerViews () {
        this.worldView
            .register(Player, PlayerView)
            .register(Enemy, EnemyView, {image: 'pig', width: 1, height: 1})
            .register(Projectile, ProjectileView, {radius: 0.08, color: '#3a2a1a'})
    }


    onStart () {
        this.#registerShaderEffects()
        this.#buildScene()
        this.#setupRenderGroups()
    }


    #registerShaderEffects () {
        const gameLayer = this.game.getCanvas('game')
        gameLayer.renderer.registerShaderEffect(ChromaticEffect)
        gameLayer.renderer.registerShaderEffect(OutlineEffect)
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
        this.entitiesGroup.addChild(this.impactParticles.particleGroup)

        this.listenTo(this.world, 'enemy:hit', (data) => {
            this.impactParticles.spawn(data.x, data.y, data.direction)
        })
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
        const deltaTime = this.game.clock?.deltaTime ?? 0.016

        this.worldView.sync(deltaTime)
        this.impactParticles.update(deltaTime)

        const gameLayer = this.game.getCanvas('game')
        gameLayer.markDirty()
        gameLayer.render()
    }

}
