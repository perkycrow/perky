import Group2D from '../render/group_2d.js'
import Sprite from '../render/sprite.js'
import WorldView from '../game/world_view.js'
import PerkyModule from '../core/perky_module.js'
import {ShadowTransform} from '../render/transforms/index.js'

import Player from './player.js'
import PigEnemy from './pig_enemy.js'
import RedEnemy from './red_enemy.js'
import GrannyEnemy from './granny_enemy.js'
import AmalgamEnemy from './amalgam_enemy.js'
import Projectile from './projectile.js'

import PlayerView from './views/player_view.js'
import PigEnemyView from './views/pig_enemy_view.js'
import RedEnemyView from './views/red_enemy_view.js'
import GrannyEnemyView from './views/granny_enemy_view.js'
import AmalgamEnemyView from './views/amalgam_enemy_view.js'
import ProjectileView from './views/projectile_view.js'
import ImpactParticles from './impact_particles.js'

import ChromaticEffect from './effects/chromatic_effect.js'
import OutlineEffect from '../render/shaders/builtin/effects/outline_effect.js'
import WaveEffect from './effects/wave_effect.js'

import HitboxDebug from './hitbox_debug.js'


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

        this.hitboxDebug = new HitboxDebug(this.world)

        this.#registerViews()
    }


    #registerViews () {
        this.worldView
            .register(Player, PlayerView)
            .register(PigEnemy, PigEnemyView, {image: 'pig', width: 1, height: 1})
            .register(RedEnemy, RedEnemyView, {image: 'red', width: 1, height: 1})
            .register(GrannyEnemy, GrannyEnemyView, {image: 'granny', width: 1, height: 1})
            .register(AmalgamEnemy, AmalgamEnemyView, {image: 'amalgam', width: 1.2, height: 1.2})
            .register(Projectile, ProjectileView)
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
        gameLayer.renderer.registerShaderEffect(WaveEffect)
    }


    #buildScene () {
        const backgroundRegion = this.game.getRegion('background')
        const backgroundHeight = 5
        const backgroundWidth = (backgroundRegion.width / backgroundRegion.height) * backgroundHeight

        const background = new Sprite({
            region: backgroundRegion,
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

        this.shadowTransform = new ShadowTransform({
            skewX: 0.1,
            scaleY: -0.5,
            offsetY: 0.0,
            color: [0, 0, 0, 0.3]
        })

        gameLayer.renderer.setRenderGroups([
            {
                $name: 'background',
                content: this.backgroundGroup
            },
            {
                $name: 'shadows',
                content: this.entitiesGroup,
                renderTransform: this.shadowTransform
            },
            {
                $name: 'entities',
                content: this.entitiesGroup
            },
            {
                $name: 'hitboxDebug',
                content: this.hitboxDebug.group
            }
        ])
    }


    render () {
        const deltaTime = this.game.clock?.deltaTime ?? 0.016

        this.worldView.sync(deltaTime)
        this.impactParticles.update(deltaTime)
        this.hitboxDebug.update()

        const gameLayer = this.game.getCanvas('game')
        gameLayer.renderer.setUniform('uTime', performance.now() / 1000)
        gameLayer.markDirty()
        gameLayer.render()
    }


    toggleHitboxDebug () {
        return this.hitboxDebug.toggle()
    }


    setHitboxDebug (enabled) {
        this.hitboxDebug.setEnabled(enabled)
    }

}
