import World from '../../game/world.js'
import Chapter1 from '../chapters/story_1_chapter.js'
import ReagentEntity from '../entities/reagent_entity.js'


const BOARD_OFFSET_X = -3
const BOARD_OFFSET_Y = -5


export default class ChapterWorld extends World {

    #boardEntities = null
    #clusterEntity0 = null
    #clusterEntity1 = null

    init () {
        this.#boardEntities = new Map()
        this.#clusterEntity0 = this.create(ReagentEntity, {active: false})
        this.#clusterEntity1 = this.create(ReagentEntity, {active: false})

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
        const spawnY = board.height + BOARD_OFFSET_Y + 0.5

        for (const reagent of board.toArray()) {
            seen.add(reagent)

            let entity = this.#boardEntities.get(reagent)

            const screenX = reagent.x + BOARD_OFFSET_X + 0.5
            const screenY = reagent.y + BOARD_OFFSET_Y + 0.5

            if (!entity) {
                entity = this.create(ReagentEntity, {
                    x: screenX,
                    y: spawnY,
                    reagentName: reagent.name
                })
                this.#boardEntities.set(reagent, entity)
            }

            entity.x = screenX
            entity.y = screenY
            entity.reagentName = reagent.name
        }

        for (const [reagent, entity] of this.#boardEntities) {
            if (!seen.has(reagent)) {
                this.removeChild(entity.$id)
                this.#boardEntities.delete(reagent)
            }
        }
    }


    syncClusterEntities (workshop, board) {
        const cluster = workshop?.currentCluster
        const clusterReagents = cluster?.reagents || []
        const entities = [this.#clusterEntity0, this.#clusterEntity1]
        const yOffset = cluster && board ? board.height - cluster.height : 0

        for (let i = 0; i < entities.length; i++) {
            const entity = entities[i]
            const reagent = clusterReagents[i]

            if (reagent) {
                entity.x = reagent.x + BOARD_OFFSET_X + 0.5
                entity.y = (yOffset + reagent.y) + BOARD_OFFSET_Y + 0.5
                entity.reagentName = reagent.name
                entity.active = true
            } else {
                entity.active = false
            }
        }
    }

}
