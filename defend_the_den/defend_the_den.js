import Game from '../game/game'
import World from './world'

import GameController from './controllers/game_controller'
import GameRenderer from './game_renderer'
import Snowman from './snowman'
import WaveProgressBar from './ui/wave_progress_bar'

import Circle from '../render/circle'
import Group2D from '../render/group_2d'

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
                    name: 'shadows',
                    type: 'webgl',
                    camera: 'main',
                    pixelRatio: 1.5,
                    backgroundColor: '#f9f9f9',
                    enableCulling: true
                },
                {
                    name: 'game',
                    type: 'webgl',
                    camera: 'main',
                    showGrid: true,
                    pixelRatio: 1.5,
                    gridStep: 1,
                    gridOpacity: 0.15,
                    gridColor: '#666666',
                    enableCulling: true
                },
                {
                    name: 'ui',
                    type: 'html',
                    camera: 'main',
                    pointerEvents: 'none'
                },
                {
                    name: 'debug',
                    type: 'canvas',
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

        const uiLayer = this.getHTML('ui')
        const waveProgress = this.create(WaveProgressBar, {
            $id: 'waveProgress',
            gameController
        })
        waveProgress.mount(uiLayer)

        // Debug layer test - animated circle
        const debugLayer = this.getCanvas('debug')
        const debugScene = new Group2D({name: 'debug'})
        const debugCircle = new Circle({
            x: 0,
            y: 1.5,
            radius: 0.3,
            color: 'white'
        })
        debugScene.add(debugCircle)
        debugLayer.setContent(debugScene)

        let time = 0
        this.on('render', () => {
            this.renderer.render()

            // Animate debug circle
            time += 0.016
            debugCircle.x = Math.sin(time * 2) * 2
            debugCircle.scaleX = 1 + Math.sin(time * 4) * 0.3
            debugCircle.scaleY = 1 + Math.sin(time * 4) * 0.3
            debugLayer.markDirty()
            debugLayer.render()
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

