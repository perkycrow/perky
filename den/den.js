import Game from '../game/game.js'
import Group2D from '../render/group_2d.js'
import Sprite from '../render/sprite.js'
import {ShadowTransform} from '../render/transforms/index.js'

import DenWorld from './den_world.js'
import DenController from './controllers/den_controller.js'

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
import WaveProgressBar from './ui/wave_progress_bar.js'
import WaveSystem from './wave_system.js'

import VignettePass from '../render/postprocessing/passes/vignette_pass.js'
import DayNightPass from './postprocessing/day_night_pass.js'

import manifest from './manifest.js'


export default class DefendTheDen extends Game {

    static $name = 'defendTheDen'
    static manifest = manifest
    static World = DenWorld
    static ActionController = DenController

    static camera = {unitsInView: {width: 7, height: 5}}
    static layers = [
        {
            name: 'game',
            type: 'webgl',
            camera: 'main',
            pixelRatio: 1.5,
            backgroundColor: '#000000',
            enableCulling: true
        },
        {
            name: 'ui',
            type: 'html',
            camera: 'main',
            pointerEvents: 'none'
        }
    ]
    static postPasses = [DayNightPass, VignettePass]

    get dayNightPass () {
        return this.getCanvas('game')?.renderer?.getPass('dayNightPass')
    }


    configureGame () {
        const gameCanvas = this.getCanvas('game')

        this.view
            .register(Player, PlayerView)
            .register(PigEnemy, PigEnemyView, {image: 'pig', width: 1, height: 1})
            .register(RedEnemy, RedEnemyView, {image: 'red', width: 1, height: 1})
            .register(GrannyEnemy, GrannyEnemyView, {image: 'granny', width: 1, height: 1})
            .register(AmalgamEnemy, AmalgamEnemyView, {image: 'amalgam', width: 1.2, height: 1.2})
            .register(Projectile, ProjectileView)

        gameCanvas.renderer.registerShaderEffect(ChromaticEffect)
        gameCanvas.renderer.registerShaderEffect(OutlineEffect)
        gameCanvas.renderer.registerShaderEffect(WaveEffect)

        this.impactParticles = this.create(ImpactParticles, {
            count: 8,
            minSpeed: 3,
            maxSpeed: 6,
            lifetime: 0.35
        })

        this.hitboxDebug = new HitboxDebug(this.world)

        this.waveSystem = this.create(WaveSystem, {$bind: 'waveSystem'})

        this.waveSystem.on('tick', ({wave, day, progress, timeOfDay, isSpawning}) => {
            this.dayNightPass?.setUniform('uAspectRatio', gameCanvas.canvas.width / gameCanvas.canvas.height)
            this.dayNightPass?.setUniform('uTime', performance.now() / 1000)
            this.dayNightPass?.setProgress(timeOfDay)
            this.updateShadows(timeOfDay)

            const denController = this.getController('den')
            denController.setSpawning(isSpawning)

            this.emit('wave:tick', {wave, progress, dayNumber: day, timeOfDay, isSpawning})
        })

        this.waveSystem.on('wave:start', ({wave, day}) => {
            const denController = this.getController('den')
            denController.onWaveStart(wave, day)
            this.emit('wave:start', {wave, dayNumber: day})
        })

        this.waveSystem.on('day:start', ({day}) => {
            this.emit('day:start', {dayNumber: day})
        })

        this.waveSystem.on('day:announce', ({day}) => {
            const denController = this.getController('den')
            denController.setSpawning(false)
            this.emit('day:announce', {dayNumber: day})
        })

        this.waveSystem.on('spawning:end', () => {
            const denController = this.getController('den')
            denController.setSpawning(false)
        })

        this.on('update', (delta) => {
            this.waveSystem.update(delta)
            this.impactParticles.update(delta)
            const enemyCount = this.world.childrenByTags('enemy').length
            this.waveSystem.checkClear(enemyCount)
        })

        const uiLayer = this.getHTML('ui')
        const waveProgressBar = this.create(WaveProgressBar, {
            $id: 'waveProgress',
            game: this
        })
        waveProgressBar.mount(uiLayer)

        this.on('day:announce', () => {
            this.playSound('howl', {channel: 'sfx', volume: 0.6})
        })

        this.world.on('enemy:hit', ({x, y, direction}) => {
            this.playSoundAt('wound', x, y, {volume: 0.4})
            this.impactParticles.spawn(x, y, direction)
        })

        this.world.on('enemy:destroyed', ({x, y}) => {
            this.playSoundAt('wound', x, y, {volume: 0.3})
        })

        this.world.on('player:hit', ({x, y}) => {
            this.playSoundAt('wound', x, y, {volume: 0.4})
        })
    }


    setupRenderGroups () {
        const gameLayer = this.getCanvas('game')

        this.backgroundGroup = new Group2D({name: 'background'})
        this.entitiesGroup = new Group2D({name: 'entities'})

        this.shadowTransform = new ShadowTransform({
            skewX: 0.1,
            scaleY: -0.5,
            offsetY: 0.0,
            color: [0, 0, 0, 0.3]
        })

        this.entitiesGroup.addChild(this.view.rootGroup)
        this.entitiesGroup.addChild(this.impactParticles.particleGroup)

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


    buildBackground () {
        const backgroundRegion = this.getRegion('background')
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
    }


    onStart () {
        super.onStart()

        this.setupRenderGroups()
        this.buildBackground()

        this.execute('spawnPlayer', {x: -2.5})

        this.emit('wave:start', {wave: 0, dayNumber: 0})
        this.emit('day:start', {dayNumber: 0})
    }


    render () {
        this.view.syncViews()
        this.hitboxDebug.update()

        const gameLayer = this.getCanvas('game')
        gameLayer.renderer.setUniform('uTime', performance.now() / 1000)
        gameLayer.markDirty()
        gameLayer.render()
    }


    setHitboxDebug (enabled) {
        this.hitboxDebug.setEnabled(enabled)
    }


    toggleHitboxDebug () {
        return this.hitboxDebug.toggle()
    }


    updateShadows (timeOfDay) {
        if (!this.shadowTransform) {
            return
        }

        const shadowParams = DayNightPass.getShadowParams(timeOfDay)
        this.shadowTransform.skewX = shadowParams.skewX
        this.shadowTransform.scaleY = shadowParams.scaleY
        this.shadowTransform.offsetY = shadowParams.offsetY
        this.shadowTransform.color = shadowParams.color
    }

}
