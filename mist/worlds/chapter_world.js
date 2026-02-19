import World from '../../game/world.js'
import Chapter1 from '../chapters/story_1_chapter.js'
import Board from '../entities/board.js'
import Reagent from '../entities/reagent.js'


export default class ChapterWorld extends World {

    #board = null
    #boardEntities = null
    #clusterReagent0 = null
    #clusterReagent1 = null

    init () {
        this.#boardEntities = new Map()
        this.#board = this.create(Board, {x: -3, y: -4.5})
        this.#clusterReagent0 = this.#board.create(Reagent, {active: false})
        this.#clusterReagent1 = this.#board.create(Reagent, {active: false})

        this.chapter = new Chapter1()
        this.chapter.triggerAction('start')
    }


    async gameAction (name, ...args) {
        const game = this.chapter?.game
        if (game) {
            await game.triggerUserAction(name, ...args)
        }
    }


    syncBoard () {
        const game = this.chapter?.game
        if (!game || !game.started) {
            return
        }

        this.syncBoardEntities(game.board)
        this.syncClusterEntities(game.workshop, game.board)
    }


    syncBoardEntities (board) {
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
                    reagentName: reagent.name
                })
                this.#boardEntities.set(reagent, entity)
            }

            entity.x = localX
            entity.y = localY
            entity.reagentName = reagent.name
        }

        for (const [reagent, entity] of this.#boardEntities) {
            if (!seen.has(reagent)) {
                this.#board.removeChild(entity.$id)
                this.#boardEntities.delete(reagent)
            }
        }
    }


    syncClusterEntities (workshop, board) {
        const cluster = workshop?.currentCluster
        const clusterReagents = cluster?.reagents || []
        const entities = [this.#clusterReagent0, this.#clusterReagent1]
        const yOffset = cluster && board ? board.height - cluster.height : 0

        for (let i = 0; i < entities.length; i++) {
            const entity = entities[i]
            const reagent = clusterReagents[i]

            if (reagent) {
                entity.x = reagent.x + 0.5
                entity.y = (yOffset + reagent.y) + 0.5
                entity.reagentName = reagent.name
                entity.active = true
            } else {
                entity.active = false
            }
        }
    }

}
