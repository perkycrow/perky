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

const SPAWN_FN = {
    Shade: 'spawnShade',
    Skeleton: 'spawnSkeleton',
    Rat: 'spawnRat',
    Inquisitor: 'spawnInquisitor'
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

        this.swarmCircles = new Map()
        this.targetLines = this.#createTargetLines()
    }


    loadScenario (scenario) {
        this.#clearWorld()

        for (const faction of scenario.factions) {
            const swarm = this.world.createSwarm(faction.name)

            for (const unit of faction.units) {
                const fn = SPAWN_FN[unit.type]

                if (!fn) {
                    continue
                }

                const entity = this.world[fn]({
                    x: unit.x ?? faction.x ?? 0,
                    y: unit.y ?? faction.y ?? 0,
                    faction: faction.name,
                    swarm,
                    rank: unit.rank
                })

                if (unit.spores) {
                    for (const key of unit.spores) {
                        addSpore(entity, key)
                    }
                }
            }
        }

        this.#rebuildSwarmCircles()

        const shadowSwarm = this.world.swarms.find(s => s.faction === 'shadow')

        if (this.swarmBar) {
            this.swarmBar.destroy()
        }

        if (shadowSwarm) {
            this.swarmBar = new SwarmBar(this.game.perkyView.element, shadowSwarm, this.game)
        }

        if (!this.eventLog) {
            this.eventLog = new EventLog(this.game.perkyView.element, this.world)
        }

        this.world.paused = true
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


    #clearWorld () {
        for (const entity of [...this.world.entities]) {
            entity.alive = false
            this.world.removeChild(entity.$id)
        }

        this.world.swarms = []
        this.world.battles = []
        this.world.paused = true
    }


    #setupRenderGroups () {
        const gameRenderer = this.game.getRenderer('game')

        gameRenderer.setRenderGroups([
            {$name: 'circles', content: this.circlesGroup},
            {$name: 'entities', content: this.viewsGroup},
            {$name: 'lines', content: this.linesGroup}
        ])
    }


    #rebuildSwarmCircles () {
        for (const circle of this.swarmCircles.values()) {
            this.circlesGroup.remove(circle)
        }

        this.swarmCircles.clear()

        for (const swarm of this.world.swarms) {
            const color = SWARM_COLORS[swarm.faction] || '#ffffff'
            const circle = new Circle({radius: swarm.leashRadius, color})
            circle.opacity = LEASH_OPACITY
            circle.visible = false
            this.circlesGroup.add(circle)
            this.swarmCircles.set(swarm, circle)
        }
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

}
