import Game from '../game/game.js'
import DenWorld from './den_world.js'

import GameController from './controllers/game_controller.js'
import GameRenderer from './game_renderer.js'
import WaveProgressBar from './ui/wave_progress_bar.js'

import VignettePass from '../render/postprocessing/passes/vignette_pass.js'
import DayNightPass from '../render/postprocessing/passes/day_night_pass.js'

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

        const gameLayer = this.getCanvas('game')

        this.dayNightPass = new DayNightPass()
        gameLayer.renderer.addPostPass(this.dayNightPass)
        this.dayNightPass.setNight()

        const vignettePass = new VignettePass()
        gameLayer.renderer.addPostPass(vignettePass)

        this.elapsedTime = 0
        this.currentWave = -1
        this.currentDay = -1
        this.dayPaused = false
        this.waitingForClear = false

        this.spawnRatio = 0.66
        this.waveDuration = 10
        this.dayDuration = this.waveDuration * 4
        this.dayAnnouncementDuration = 3
        this.catchUpSpeed = 3

        this.on('update', (delta) => {
            this.dayNightPass.setUniform('uAspectRatio', gameLayer.canvas.width / gameLayer.canvas.height)
            this.dayNightPass.setUniform('uCameraRatio', this.camera.unitsInView.width / this.camera.unitsInView.height)

            if (this.dayPaused) {
                return
            }

            if (this.waitingForClear) {
                this.#checkWaveClear()
                return
            }

            const timeInDay = this.elapsedTime % this.dayDuration
            const timeOfDay = timeInDay / this.dayDuration
            const dayNumber = Math.floor(this.elapsedTime / this.dayDuration)

            const wave = Math.floor(timeOfDay * 4)
            const waveProgress = (timeOfDay * 4) % 1
            const isSpawning = waveProgress < this.spawnRatio
            const isInCooldown = !isSpawning

            const hasEnemies = this.world.childrenByTags('enemy').length > 0

            let timeScale = 1
            if (isInCooldown && !hasEnemies) {
                timeScale = this.catchUpSpeed
            }

            if (waveProgress >= 0.99 && hasEnemies) {
                this.waitingForClear = true
                gameController.setSpawning(false)
                this.emit('wave:tick', {wave, progress: 1, dayNumber, timeOfDay, isSpawning: false})
                return
            }

            this.elapsedTime += delta * timeScale

            this.dayNightPass.setUniform('uTime', this.elapsedTime)
            this.dayNightPass.setProgress(timeOfDay)

            if (this.renderer.shadowTransform) {
                const shadowParams = this.dayNightPass.getShadowParams(timeOfDay)
                this.renderer.shadowTransform.skewX = shadowParams.skewX
                this.renderer.shadowTransform.scaleY = shadowParams.scaleY
                this.renderer.shadowTransform.offsetY = shadowParams.offsetY
                this.renderer.shadowTransform.color = shadowParams.color
            }

            if (dayNumber !== this.currentDay) {
                this.currentDay = dayNumber
                this.#announceDay(dayNumber, gameController)
            }

            if (wave !== this.currentWave) {
                this.currentWave = wave
                gameController.onWaveStart(wave, dayNumber)
                this.emit('wave:start', {wave, dayNumber})
            }

            gameController.setSpawning(isSpawning && !this.dayPaused)

            this.emit('wave:tick', {wave, progress: waveProgress, dayNumber, timeOfDay, isSpawning})
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
    }


    #announceDay (dayNumber, gameController) {
        if (dayNumber > 0) {
            this.dayPaused = true
            gameController.setSpawning(false)
            this.emit('day:announce', {dayNumber})

            setTimeout(() => {
                this.dayPaused = false
                this.emit('day:start', {dayNumber})
            }, this.dayAnnouncementDuration * 1000)
        } else {
            this.emit('day:start', {dayNumber})
        }
    }


    #checkWaveClear () {
        const enemies = this.world.childrenByTags('enemy')

        if (enemies.length === 0) {
            this.waitingForClear = false
            this.elapsedTime = Math.ceil(this.elapsedTime / this.waveDuration) * this.waveDuration
        }
    }

}
