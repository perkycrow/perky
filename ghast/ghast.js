import Game from '../game/game.js'
import GhastWorld from './ghast_world.js'
import GhastController from './controllers/ghast_controller.js'
import GroundPass from './postprocessing/ground_pass.js'
import manifest from './manifest.js'

import Player from './player.js'
import PlayerView from './views/player_view.js'


export default class Ghast extends Game {

    static $name = 'ghast'
    static manifest = manifest
    static World = GhastWorld
    static ActionController = GhastController

    static camera = {unitsInView: {width: 4.5, height: 4.5}}
    static layer = {type: 'webgl', backgroundColor: 'transparent', pixelRatio: 1}

    configureGame () {
        this.worldView.register(Player, PlayerView)

        const gameLayer = this.getCanvas('game')
        this.groundPass = new GroundPass()
        gameLayer.renderer.addPostPass(this.groundPass)

        this.on('update', () => {
            this.#updateCamera()
            this.#updateGroundPass()
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
