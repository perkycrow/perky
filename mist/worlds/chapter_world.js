import World from '../../game/world.js'
import skillFactory from '../factories/main_skill_factory.js'
import artifactFactory from '../factories/main_artifact_factory.js'
import Chapter1 from '../chapters/story_1_chapter.js'
import Board from '../entities/board.js'
import Reagent from '../entities/reagent.js'


const GRAVITY_DELAY = 200
const DEPOP_DELAY = 380
const POP_DELAY = 330


export default class ChapterWorld extends World {

    #board = null
    #boardEntities = null
    #clusterReagent0 = null
    #clusterReagent1 = null

    init () {
        this.#boardEntities = new Map()

        this.#board = this.create(Board, {x: -3, y: -4.5})
        this.#board.initGame({
            lab: {
                reagentsCount: Chapter1.reagentsCount,
                unlockedCount: Chapter1.unlockedCount,
                startsAt: Chapter1.startsAt
            }
        }, {skillFactory, artifactFactory})

        this.#clusterReagent0 = this.#board.workshop.create(Reagent, {active: false})
        this.#clusterReagent1 = this.#board.workshop.create(Reagent, {active: false})

        this.#initAnimationHooks()
        this.#board.actionSet.trigger('start')
    }


    async gameAction (name, ...args) {
        return this.#board.triggerUserAction(name, ...args)
    }


    syncBoard () {
        const board = this.#board

        if (!board || !board.playing) {
            return
        }

        this.syncBoardEntities()
        this.syncClusterEntities()
    }


    syncBoardEntities () {
        const board = this.#board
        const seen = new Set()
        const spawnY = board.height + 0.5

        for (const reagent of board.toArray()) {
            seen.add(reagent)

            let entity = this.#boardEntities.get(reagent)

            const localX = reagent.x + 0.5
            const localY = reagent.y + 0.5

            if (!entity) {
                entity = this.#board.create(Reagent, {
                    x: localX,
                    y: spawnY,
                    name: reagent.name
                })
                this.#boardEntities.set(reagent, entity)
            }

            if (!entity.merging) {
                entity.x = localX
                entity.y = localY
                entity.name = reagent.name
            }
        }

        for (const [reagent, entity] of this.#boardEntities) {
            if (!seen.has(reagent)) {
                this.#board.removeChild(entity.$id)
                this.#boardEntities.delete(reagent)
            }
        }
    }


    syncClusterEntities () {
        const board = this.#board
        const workshop = board.workshop
        const cluster = workshop.currentCluster
        const clusterReagents = cluster?.reagents || []
        const entities = [this.#clusterReagent0, this.#clusterReagent1]
        const yOffset = cluster ? board.height - cluster.height : 0

        for (let i = 0; i < entities.length; i++) {
            const entity = entities[i]
            const reagent = clusterReagents[i]

            if (reagent) {
                entity.x = reagent.x + 0.5
                entity.y = (yOffset + reagent.y) + 0.5
                entity.name = reagent.name
                entity.active = true
            } else {
                entity.active = false
            }
        }
    }


    #initAnimationHooks () {
        const board = this.#board

        board.actionSet.hook('applyGravity', async () => {
            await delay(GRAVITY_DELAY)
        })

        board.actionSet.hook('mergeReagents', async (flow, merge) => {
            this.syncBoardEntities()

            const {reagents, first} = merge
            const targetX = first.x + 0.5
            const targetY = first.y + 0.5

            const firstEntity = this.#boardEntities.get(first)
            if (firstEntity) {
                firstEntity.absorbing = true
            }

            for (const reagent of reagents) {
                const entity = this.#boardEntities.get(reagent)
                if (entity) {
                    entity.merging = true
                    entity.x = targetX
                    entity.y = targetY
                }
            }

            await delay(DEPOP_DELAY)
        })

        board.actionSet.hook('evolveReagents', async () => {
            await delay(POP_DELAY)
        })
    }

}


function delay (ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}
