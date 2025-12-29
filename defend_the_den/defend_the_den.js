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
import logger from '../core/logger'
import Vec2 from '../math/vec2'

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
        logger.title('Defend The Den')
        logger.info('Configuring game...')
        logger.info('Version: 1.0.0')
        logger.info('Build: development')

        this.world = this.create(World)
        logger.success('World created')
        logger.info('World dimensions:', new Vec2(100, 100))

        this.camera = this.renderSystem.getCamera('main')
        logger.info('Camera initialized')
        logger.info('Units in view:', new Vec2(7, 5))

        this.registerController('game', GameController)
        this.setActiveControllers(['game'])
        logger.info('Controllers registered')
        logger.success('GameController active')

        this.renderer = this.create(GameRenderer, {
            $id: 'renderer',
            world: this.world,
            game: this
        })

        const gameController = this.getController('game')
        gameController.world = this.world

        logger.spacer()
        logger.title('Post-Processing')

        // Setup post-processing on game layer
        const gameLayer = this.getCanvas('game')
        const vignettePass = new VignettePass()
        vignettePass.setUniform('uIntensity', 1.0)
        vignettePass.setUniform('uSmoothness', 0.4)
        gameLayer.renderer.addPostPass(vignettePass)
        logger.success('VignettePass added')
        logger.info('Intensity: 1.0, Smoothness: 0.4')

        // const colorGradePass = new ColorGradePass()
        // colorGradePass.setUniform('uBrightness', 0.02)
        // colorGradePass.setUniform('uContrast', 1.05)
        // colorGradePass.setUniform('uSaturation', 1.1)
        // gameLayer.renderer.addPostPass(colorGradePass)

        logger.spacer()
        logger.title('UI Layer')

        const uiLayer = this.getHTML('ui')
        const waveProgress = this.create(WaveProgressBar, {
            $id: 'waveProgress',
            gameController
        })
        waveProgress.mount(uiLayer)
        logger.success('WaveProgressBar mounted')
        logger.info('UI layer initialized')

        this.on('render', () => {
            this.renderer.render()
        })

        logger.spacer()
        logger.notice('Configuration complete')
    }

    onStart () {
        logger.spacer()
        logger.title('Game Start')
        logger.info('Initializing game state...')

        this.execute('spawnPlayer', {x: -2.5})
        logger.success('Player spawned at x:', -2.5)
        logger.info('Player position:', new Vec2(-2.5, 0))
        logger.info('Player health: 100')
        logger.info('Player speed: 5')

        logger.spacer()
        logger.title('Entities')

        this.world.create(Snowman, {
            $id: 'snowman',
            x: 2,
            y: 0
        })
        logger.info('Snowman created at', new Vec2(2, 0))
        logger.info('Snowman health: 50')

        logger.spacer()
        logger.title('Wave System')

        const gameController = this.getController('game')
        gameController.startWave(0)
        logger.warn('Wave 0 started!')
        logger.info('Enemies to spawn: 5')
        logger.info('Wave difficulty: Easy')
        logger.notice('Prepare for battle!')

        logger.spacer()
        logger.success('Game is running')
        logger.info('FPS target: 60')
        logger.info('Render mode: WebGL')
    }

}

