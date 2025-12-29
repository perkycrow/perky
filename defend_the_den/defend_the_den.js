import Game from '../game/game'
import World from './world'

import GameController from './controllers/game_controller'
import GameRenderer from './game_renderer'
import Snowman from './snowman'
import WaveProgressBar from './ui/wave_progress_bar'

import VignettePass from '../render/postprocessing/passes/vignette_pass'
import ColorGradePass from '../render/postprocessing/passes/color_grade_pass'

import manifest from './manifest'
import debug from '../core/debug'

debug.enableDebug()
window.debug = debug


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
                    backgroundColor: '#f9f9f9',
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
        this.world = this.create(World)

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

        // Setup post-processing on game layer
        const gameLayer = this.getCanvas('game')
        const vignettePass = new VignettePass()
        vignettePass.setUniform('uIntensity', 1.0)
        vignettePass.setUniform('uSmoothness', 0.4)
        gameLayer.renderer.addPostPass(vignettePass)

        // const colorGradePass = new ColorGradePass()
        // colorGradePass.setUniform('uBrightness', 0.02)
        // colorGradePass.setUniform('uContrast', 1.05)
        // colorGradePass.setUniform('uSaturation', 1.1)
        // gameLayer.renderer.addPostPass(colorGradePass)

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

        this.world.create(Snowman, {
            $id: 'snowman',
            x: 2,
            y: 0
        })

        const gameController = this.getController('game')
        gameController.startWave(0)
    }

}

