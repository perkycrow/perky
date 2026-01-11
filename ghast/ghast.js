import Game from '../game/game.js'
import GhastWorld from './ghast_world.js'
import GameController from './controllers/game_controller.js'
import GameRenderer from './game_renderer.js'
import GroundPass from './postprocessing/ground_pass.js'


export default class Ghast extends Game {

    static $name = 'ghast'

    constructor (params = {}) {
        const renderSystemConfig = {
            cameras: {
                main: {
                    unitsInView: {width: 8, height: 6}
                }
            },
            layers: [
                {
                    name: 'game',
                    type: 'webgl',
                    camera: 'main',
                    backgroundColor: 'transparent'
                }
            ]
        }

        super({
            ...params,
            renderSystem: renderSystemConfig
        })
    }


    configureGame () {
        this.world = this.create(GhastWorld)

        this.camera = this.renderSystem.getCamera('main')

        this.registerController('game', GameController)
        this.setActiveControllers(['game'])

        const gameController = this.getController('game')
        gameController.world = this.world

        this.renderer = this.create(GameRenderer, {
            $id: 'renderer',
            world: this.world,
            game: this
        })

        gameController.renderer = this.renderer

        // Setup ground pass
        const gameLayer = this.getCanvas('game')
        this.groundPass = new GroundPass()
        gameLayer.renderer.addPostPass(this.groundPass)

        this.on('update', () => {
            this.#updateCamera()
            this.#updateGroundPass()
        })

        this.on('render', () => {
            this.renderer.render()
        })
    }


    #updateCamera () {
        const player = this.world.player
        if (player) {
            this.camera.x = player.x
            this.camera.y = player.y
        }
    }


    #updateGroundPass () {
        const gameLayer = this.getCanvas('game')

        this.groundPass.setUniform('uCameraPos', [this.camera.x, this.camera.y])
        this.groundPass.setUniform('uResolution', [gameLayer.canvas.width, gameLayer.canvas.height])
        this.groundPass.setUniform('uPixelsPerUnit', this.camera.pixelsPerUnit)
        this.groundPass.setUniform('uTime', performance.now() / 1000)
    }


    onStart () {
        this.execute('spawnPlayer', {x: 0, y: 0})
    }

}
