import Game from '../game/game.js'
import DenWorld from './den_world.js'

import DenController from './controllers/den_controller.js'
import DenRenderer from './den_renderer.js'
import WaveProgressBar from './ui/wave_progress_bar.js'
import WaveSystem from './wave_system.js'

import VignettePass from '../render/postprocessing/passes/vignette_pass.js'
import DayNightPass from './postprocessing/day_night_pass.js'

import manifest from './manifest.js'


export default class DefendTheDen extends Game {

    static $name = 'defendTheDen'
    static manifest = manifest
    static World = DenWorld
    static Renderer = DenRenderer
    static Controller = DenController

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

        this.waveSystem = this.create(WaveSystem, {$bind: 'waveSystem'})

        this.waveSystem.on('tick', ({wave, day, progress, timeOfDay, isSpawning}) => {
            this.dayNightPass?.setUniform('uAspectRatio', gameCanvas.canvas.width / gameCanvas.canvas.height)
            this.dayNightPass?.setUniform('uTime', performance.now() / 1000)
            this.dayNightPass?.setProgress(timeOfDay)
            this.#updateShadows(timeOfDay)

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

        this.world.on('enemy:hit', ({x, y}) => {
            this.playSoundAt('wound', x, y, {volume: 0.4})
        })

        this.world.on('enemy:destroyed', ({x, y}) => {
            this.playSoundAt('wound', x, y, {volume: 0.3})
        })

        this.world.on('player:hit', ({x, y}) => {
            this.playSoundAt('wound', x, y, {volume: 0.4})
        })
    }


    onStart () {
        super.onStart()

        this.execute('spawnPlayer', {x: -2.5})

        this.emit('wave:start', {wave: 0, dayNumber: 0})
        this.emit('day:start', {dayNumber: 0})
    }


    setHitboxDebug (enabled) {
        this.renderer.setHitboxDebug(enabled)
    }


    #updateShadows (timeOfDay) {
        if (!this.renderer.shadowTransform) {
            return
        }

        const shadowParams = DayNightPass.getShadowParams(timeOfDay)
        this.renderer.shadowTransform.skewX = shadowParams.skewX
        this.renderer.shadowTransform.scaleY = shadowParams.scaleY
        this.renderer.shadowTransform.offsetY = shadowParams.offsetY
        this.renderer.shadowTransform.color = shadowParams.color
    }

}
