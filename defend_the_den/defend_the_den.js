import Game from '../game/game.js'
import DenWorld from './den_world.js'

import GameController from './controllers/game_controller.js'
import GameRenderer from './game_renderer.js'
import WaveProgressBar from './ui/wave_progress_bar.js'

import VignettePass from '../render/postprocessing/passes/vignette_pass.js'
import DayNightPass from './postprocessing/day_night_pass.js'

import manifest from './manifest.js'
import debug from '../core/debug.js'
import logger from '../core/logger.js'


debug.enableDebug()
window.debug = debug
window.logger = logger

export default class DefendTheDen extends Game {

    static $name = 'defendTheDen'
    static manifest = manifest

    constructor (params = {}) {
        const renderSystemConfig = {
            cameras: {
                main: {
                    unitsInView: {width: 7, height: 5}
                }
            },
            layers: [
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
        }

        super({
            ...params,
            renderSystem: renderSystemConfig
        })
    }


    configureGame () {

        this.world = this.create(DenWorld)

        this.camera = this.renderSystem.getCamera('main')

        this.registerController('game', GameController)
        this.setActiveControllers(['game'])


        this.renderer = this.create(GameRenderer, {
            $id: 'renderer',
            world: this.world,
            game: this
        })

        const gameController = this.getController('game')
        gameController.world = this.world
        gameController.renderer = this.renderer

        const gameLayer = this.getCanvas('game')

        this.dayNightPass = new DayNightPass()
        gameLayer.renderer.addPostPass(this.dayNightPass)
        this.dayNightPass.setNight()

        const vignettePass = new VignettePass()
        gameLayer.renderer.addPostPass(vignettePass)

        this.currentWave = 0
        this.currentDay = 0
        this.dayPaused = false
        this.waitingForClear = false

        this.waveSpawnDurations = [25, 25, 25, 25]
        this.dayAnnouncementDuration = 3

        this.timeOfDay = 0
        this.waveElapsedTime = 0

        this.on('update', (delta) => {
            this.dayNightPass.setUniform('uAspectRatio', gameLayer.canvas.width / gameLayer.canvas.height)

            if (this.dayPaused) {
                return
            }

            if (this.waitingForClear) {
                this.#checkWaveClear()
                return
            }

            const wave = this.currentWave
            const dayNumber = this.currentDay
            const spawnDuration = this.waveSpawnDurations[wave]
            const waveProgress = Math.min(this.waveElapsedTime / spawnDuration, 1)
            const isSpawning = waveProgress < 1

            if (isSpawning) {
                this.waveElapsedTime += delta

                const waveStartTimeOfDay = wave * 0.25
                this.timeOfDay = waveStartTimeOfDay + waveProgress * 0.25
            }

            const hasEnemies = this.world.childrenByTags('enemy').length > 0

            if (!isSpawning && hasEnemies) {
                this.waitingForClear = true
                gameController.setSpawning(false)
                this.emit('wave:tick', {wave, progress: 1, dayNumber, timeOfDay: this.timeOfDay, isSpawning: false})
                return
            }

            this.dayNightPass.setProgress(this.timeOfDay)
            this.#updateShadows(this.timeOfDay)

            gameController.setSpawning(isSpawning)

            this.emit('wave:tick', {wave, progress: waveProgress, dayNumber, timeOfDay: this.timeOfDay, isSpawning})
        })

        const uiLayer = this.getHTML('ui')
        const waveProgressBar = this.create(WaveProgressBar, {
            $id: 'waveProgress',
            game: this
        })
        waveProgressBar.mount(uiLayer)

        this.on('render', () => {
            this.renderer.render()
        })
    }


    onStart () {
        this.execute('spawnPlayer', {x: -2.5})

        const gameController = this.getController('game')
        gameController.onWaveStart(0, 0)
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


    #checkWaveClear () {
        const enemies = this.world.childrenByTags('enemy')

        if (enemies.length === 0) {
            this.waitingForClear = false
            this.#startNextWave()
        }
    }


    #startNextWave () {
        const nextWave = this.currentWave + 1
        const gameController = this.getController('game')

        if (nextWave >= 4) {
            this.currentDay++
            this.currentWave = 0
            this.timeOfDay = 0
            this.waveElapsedTime = 0

            this.dayPaused = true
            gameController.setSpawning(false)
            this.emit('day:announce', {dayNumber: this.currentDay})

            setTimeout(() => {
                this.dayPaused = false
                gameController.onWaveStart(0, this.currentDay)
                this.emit('wave:start', {wave: 0, dayNumber: this.currentDay})
                this.emit('day:start', {dayNumber: this.currentDay})
            }, this.dayAnnouncementDuration * 1000)
        } else {
            this.currentWave = nextWave
            this.waveElapsedTime = 0
            gameController.onWaveStart(nextWave, this.currentDay)
            this.emit('wave:start', {wave: nextWave, dayNumber: this.currentDay})
        }
    }

}
