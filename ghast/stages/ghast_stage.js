import Stage from '../../game/stage.js'
import GhastWorld from '../ghast_world.js'
import GhastController from '../controllers/ghast_controller.js'
import GroundPass from '../postprocessing/ground_pass.js'
import wiring from '../wiring.js'


export default class GhastStage extends Stage {

    static World = GhastWorld
    static ActionController = GhastController

    onStart () {
        super.onStart()
        wiring.registerViews(this)
        this.game.getLayer('game').setContent(this.viewsGroup)
        this.groundPass = this.addPostPass(GroundPass)

        const shadowSwarm = this.world.createSwarm('shadow')
        const lightSwarm = this.world.createSwarm('light')

        // Shadow team (left)
        this.game.execute('spawnShade', {x: -4, y: 0, team: 'shadow', swarm: shadowSwarm})
        this.game.execute('spawnSkeleton', {x: -3, y: 1, team: 'shadow', swarm: shadowSwarm})
        this.game.execute('spawnRat', {x: -3, y: -1, team: 'shadow', swarm: shadowSwarm})
        this.game.execute('spawnInquisitor', {x: -5, y: 0.5, team: 'shadow', swarm: shadowSwarm})

        // Light team (right)
        this.game.execute('spawnShade', {x: 4, y: 0, team: 'light', swarm: lightSwarm})
        this.game.execute('spawnSkeleton', {x: 3, y: -1, team: 'light', swarm: lightSwarm})
        this.game.execute('spawnRat', {x: 3, y: 1, team: 'light', swarm: lightSwarm})
        this.game.execute('spawnInquisitor', {x: 5, y: -0.5, team: 'light', swarm: lightSwarm})
    }


    update (deltaTime) {
        this.world.update(deltaTime, this.game)
        super.update(deltaTime)
    }


    render () {
        this.syncViews()
        this.#updateGroundPass()
    }


    #updateGroundPass () {
        if (!this.groundPass) {
            return
        }

        const camera = this.game.camera
        const gameLayer = this.game.getLayer('game')
        const gameRenderer = this.game.getRenderer('game')

        this.groundPass.setUniform('uCameraPos', [camera.x, camera.y])
        this.groundPass.setUniform('uResolution', [gameLayer.canvas.width, gameLayer.canvas.height])
        this.groundPass.setUniform('uPixelsPerUnit', camera.pixelsPerUnit * gameRenderer.pixelRatio)
        this.groundPass.setUniform('uTime', performance.now() / 1000)
    }

}
