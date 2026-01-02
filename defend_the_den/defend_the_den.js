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
        this.on('update', (delta) => {
            this.elapsedTime += delta
            this.dayNightPass.setUniform('uTime', this.elapsedTime)
            this.dayNightPass.setTimeOfDay(this.elapsedTime * 0.1)
        })

        const uiLayer = this.getHTML('ui')
        const waveProgress = this.create(WaveProgressBar, {
            $id: 'waveProgress',
            gameController
        })
        waveProgress.mount(uiLayer)

        this.on('render', () => {
            this.renderer.render()
        })
    }


    onStart () {
        this.execute('spawnPlayer', {x: -2.5})

        const gameController = this.getController('game')
        gameController.startWave(0)
    }

}
