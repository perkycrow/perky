import Stage from '../../game/stage.js'
import GhastWorld from '../ghast_world.js'
import GhastController from '../controllers/ghast_controller.js'
import GroundPass from '../postprocessing/ground_pass.js'
import SwarmBar from '../ui/swarm_bar.js'
import EventLog from '../ui/event_log.js'
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
        const chaosSwarm = this.world.createSwarm('chaos')

        this.game.execute('spawnShade', {x: -3, y: 0, faction: 'shadow', swarm: shadowSwarm})
        this.game.execute('spawnSkeleton', {x: -3.8, y: -0.8, faction: 'shadow', swarm: shadowSwarm})
        this.game.execute('spawnRat', {x: -2.5, y: -0.6, faction: 'shadow', swarm: shadowSwarm})

        this.game.execute('spawnShade', {x: 3, y: 0, faction: 'light', swarm: lightSwarm})
        this.game.execute('spawnInquisitor', {x: 3.8, y: -0.8, faction: 'light', swarm: lightSwarm})
        this.game.execute('spawnRat', {x: 2.5, y: -0.6, faction: 'light', swarm: lightSwarm})

        this.game.execute('spawnShade', {x: 0, y: 4, faction: 'chaos', swarm: chaosSwarm})
        this.game.execute('spawnSkeleton', {x: -0.6, y: 3.3, faction: 'chaos', swarm: chaosSwarm})
        this.game.execute('spawnInquisitor', {x: 0.6, y: 3.3, faction: 'chaos', swarm: chaosSwarm})

        this.swarmBar = new SwarmBar(this.game.perkyView.element, shadowSwarm, this.game)
        this.eventLog = new EventLog(this.game.perkyView.element, this.world)
    }


    update (deltaTime) {
        this.world.update(deltaTime, this.game)
        super.update(deltaTime)
    }


    render () {
        this.syncViews()
        this.#updateGroundPass()
        this.swarmBar?.update()
        this.eventLog?.update()
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
