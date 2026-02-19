import World from '../../game/world.js'
import Chapter1 from '../chapters/story_1_chapter.js'
import ReagentEntity from '../entities/reagent_entity.js'
import reagents from '../data/reagents.js'


const BOARD_OFFSET_X = -3
const BOARD_OFFSET_Y = -5

const PALETTE = [
    '#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6',
    '#1abc9c', '#e67e22', '#2980b9', '#27ae60', '#c0392b',
    '#8e44ad', '#16a085', '#d35400', '#2c3e50', '#f1c40f',
    '#7f8c8d', '#e91e63', '#00bcd4', '#4caf50', '#ff9800'
]


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
                    reagentName: reagent.name,
                    color: colorFor(reagent.name)
                })
                this.#boardEntities.set(reagent, entity)
            }

            entity.x = screenX
            entity.y = screenY
            entity.color = colorFor(reagent.name)
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
                entity.color = colorFor(reagent.name)
                entity.active = true
            } else {
                entity.active = false
            }
        }
    }

}


function colorFor (name) {
    const index = reagents.indexOf(name)
    if (index < 0) {
        return '#95a5a6'
    }
    return PALETTE[index % PALETTE.length]
}
