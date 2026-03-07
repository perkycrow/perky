import Stage from '../../game/stage.js'
import Circle from '../../render/circle.js'
import GhastWorld from '../ghast_world.js'
import GhastController from '../controllers/ghast_controller.js'
import GroundPass from '../postprocessing/ground_pass.js'
import SwarmBar from '../ui/swarm_bar.js'
import EventLog from '../ui/event_log.js'
import {addSpore} from '../spores.js'
import wiring from '../wiring.js'


const SWARM_COLORS = {
    shadow: '#8033ff',
    light: '#ff3333',
    chaos: '#33cc55'
}

const LEASH_OPACITY = 0.5


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

        this.game.execute('spawnShade', {x: -3, y: 0, faction: 'shadow', swarm: shadowSwarm, rank: 3})
        this.game.execute('spawnSkeleton', {x: -3.8, y: -0.8, faction: 'shadow', swarm: shadowSwarm, rank: 2})
        this.game.execute('spawnRat', {x: -2.5, y: -0.6, faction: 'shadow', swarm: shadowSwarm})

        this.game.execute('spawnShade', {x: 3, y: 0, faction: 'light', swarm: lightSwarm, rank: 3})
        this.game.execute('spawnInquisitor', {x: 3.8, y: -0.8, faction: 'light', swarm: lightSwarm, rank: 2})
        this.game.execute('spawnRat', {x: 2.5, y: -0.6, faction: 'light', swarm: lightSwarm})

        this.game.execute('spawnShade', {x: 0, y: 4, faction: 'chaos', swarm: chaosSwarm, rank: 3})
        this.game.execute('spawnSkeleton', {x: -0.6, y: 3.3, faction: 'chaos', swarm: chaosSwarm, rank: 2})
        this.game.execute('spawnInquisitor', {x: 0.6, y: 3.3, faction: 'chaos', swarm: chaosSwarm, rank: 2})

        this.#assignDefaultSpores()

        this.swarmCircles = this.#createSwarmCircles()
        this.swarmBar = new SwarmBar(this.game.perkyView.element, shadowSwarm, this.game)
        this.eventLog = new EventLog(this.game.perkyView.element, this.world)
    }


    update (deltaTime) {
        this.world.update(deltaTime, this.game)
        super.update(deltaTime)
    }


    render () {
        this.syncViews()
        this.#updateSwarmCircles()
        this.#updateGroundPass()
        this.swarmBar?.update()
        this.eventLog?.update()
    }


    #createSwarmCircles () {
        const circles = new Map()

        for (const swarm of this.world.swarms) {
            const color = SWARM_COLORS[swarm.faction] || '#ffffff'
            const circle = new Circle({radius: swarm.leashRadius, color})
            circle.opacity = LEASH_OPACITY
            circle.visible = false
            circle.setDepth(-100)
            this.viewsGroup.add(circle)
            circles.set(swarm, circle)
        }

        return circles
    }


    #updateSwarmCircles () {
        for (const [swarm, circle] of this.swarmCircles) {
            const leader = swarm.leader

            if (!leader || leader.dying) {
                circle.visible = false
                continue
            }

            circle.x = leader.x
            circle.y = leader.y
            circle.radius = swarm.leashRadius
            circle.visible = true
        }
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


    #assignDefaultSpores () {
        for (const entity of this.world.entities) {
            if (!entity.spores) {
                continue
            }

            const name = entity.constructor.name

            if (name === 'Shade') {
                addSpore(entity, 'anger')
                addSpore(entity, 'arrogance')
                addSpore(entity, 'fear')
            } else if (name === 'Skeleton') {
                addSpore(entity, 'sadness')
                addSpore(entity, 'anger')
            } else if (name === 'Inquisitor') {
                addSpore(entity, 'fear')
                addSpore(entity, 'surprise')
            } else if (name === 'Rat') {
                addSpore(entity, 'naive')
            }
        }
    }

}
