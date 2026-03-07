import Stage from '../../game/stage.js'
import Circle from '../../render/circle.js'
import Line from '../../render/line.js'
import Group2D from '../../render/group_2d.js'
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
const TARGET_LINE_OPACITY = 0.3
const TARGET_LINE_WIDTH = 0.02
const TARGET_LINE_POOL_SIZE = 20


export default class GhastStage extends Stage {

    static World = GhastWorld
    static ActionController = GhastController

    onStart () {
        super.onStart()
        wiring.registerViews(this)

        this.circlesGroup = new Group2D()
        this.linesGroup = new Group2D()
        this.#setupRenderGroups()

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
        this.targetLines = this.#createTargetLines()
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
        this.#updateTargetLines()
        this.#updateGroundPass()
        this.swarmBar?.update()
        this.eventLog?.update()
    }


    #setupRenderGroups () {
        const gameRenderer = this.game.getRenderer('game')

        gameRenderer.setRenderGroups([
            {$name: 'circles', content: this.circlesGroup},
            {$name: 'entities', content: this.viewsGroup},
            {$name: 'lines', content: this.linesGroup}
        ])
    }


    #createSwarmCircles () {
        const circles = new Map()

        for (const swarm of this.world.swarms) {
            const color = SWARM_COLORS[swarm.faction] || '#ffffff'
            const circle = new Circle({radius: swarm.leashRadius, color})
            circle.opacity = LEASH_OPACITY
            circle.visible = false
            this.circlesGroup.add(circle)
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


    #createTargetLines () {
        const lines = []

        for (let i = 0; i < TARGET_LINE_POOL_SIZE; i++) {
            const line = new Line({lineWidth: TARGET_LINE_WIDTH})
            line.opacity = TARGET_LINE_OPACITY
            line.visible = false
            this.linesGroup.add(line)
            lines.push(line)
        }

        return lines
    }


    #updateTargetLines () {
        let lineIndex = 0

        for (const entity of this.world.entities) {
            if (!entity.target || entity.dying || entity.target.dying) {
                continue
            }

            if (lineIndex >= this.targetLines.length) {
                break
            }

            const line = this.targetLines[lineIndex]
            line.x = entity.x
            line.y = entity.y
            line.x2 = entity.target.x - entity.x
            line.y2 = entity.target.y - entity.y
            line.color = SWARM_COLORS[entity.faction] || '#ffffff'
            line.visible = true
            lineIndex++
        }

        for (let i = lineIndex; i < this.targetLines.length; i++) {
            this.targetLines[i].visible = false
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
