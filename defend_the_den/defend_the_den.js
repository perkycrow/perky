import Game from '../game/game'
import World from './world'

import GameController from './controllers/game_controller'
import GameRenderer from './game_renderer'

// import Canvas2D from '../canvas/canvas_2d'
import WebGLCanvas2D from '../render/webgl_canvas_2d'
import Camera2D from '../render/camera_2d'

import manifest from './manifest'
import debug from '../core/debug'

debug.enableDebug()
window.debug = debug


export default class DefendTheDen extends Game {

    static manifest = manifest

    configure () {
        this.world = new World()

        this.camera = new Camera2D({
            unitsInView: {width: 7, height: 5}
        })

        this.canvas = new WebGLCanvas2D({
            container: this.element,
            autoFit: true,
            camera: this.camera,
            showGrid: true,
            pixelRatio: 1.5,
            gridStep: 1,
            gridOpacity: 0.15,
            gridColor: '#666666',
            backgroundColor: '#f9f9f9',
            enableCulling: true
        })

        this.registerController('game', GameController)
        this.setActiveControllers(['game'])

        this.renderer = new GameRenderer({
            world: this.world,
            game: this
        })

        const gameController = this.getController('game')
        gameController.world = this.world


        this.on('render', () => {
            this.renderer.render()
        })
    }

    onStart () {
        this.renderer.initialize()

        this.execute('spawnPlayer', {x: -2.5})

        const gameController = this.getController('game')
        gameController.startWave(0)
    }

}

