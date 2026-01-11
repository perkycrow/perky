import Game from '../game/game.js'
import GhastWorld from './ghast_world.js'
import GhastController from './controllers/ghast_controller.js'
import GameRenderer from './game_renderer.js'
import GroundPass from './postprocessing/ground_pass.js'
import manifest from './manifest.js'


export default class Ghast extends Game {

    static $name = 'ghast'
    static manifest = manifest

    constructor (params = {}) {
        const renderSystemConfig = {
            cameras: {
                main: {
                    unitsInView: {width: 4.5, height: 4.5}
                }
            },
            layers: [
                {
                    name: 'game',
                    type: 'webgl',
                    camera: 'main',
                    backgroundColor: 'transparent',
                    pixelRatio: 1
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

        this.renderer = this.create(GameRenderer, {
            $id: 'renderer',
            world: this.world,
            game: this
        })

        this.registerController(GhastController)


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
        this.groundPass.setUniform('uPixelsPerUnit', this.camera.pixelsPerUnit * gameLayer.renderer.pixelRatio)
        this.groundPass.setUniform('uTime', performance.now() / 1000)
    }


    onStart () {
        this.#buildTextureAtlases()
        this.execute('spawnPlayer', {x: 0, y: 0})
    }


    #buildTextureAtlases () {
        const assets = this.getAllAssets()
        this.textureSystem.buildFromAssets(assets)
    }

}
