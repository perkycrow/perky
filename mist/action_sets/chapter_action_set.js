import ActionSet from '../libs/action_set.js'
import Board from '../entities/board.js'


export default class ChapterActionSet extends ActionSet {

    constructor (chapter) {
        super()

        initActions(chapter, this)
    }

}


function initActions (chapter, actionSet) {

    const {set} = actionSet.getApi()

    set('start', (flow) => {
        if (!chapter.started) {
            chapter.started = true
            flow.enqueue('initGame')
            flow.enqueue('startGame')

            return true
        }

        return false
    })


    set('end', async () => {
        if (chapter.started) {
            return true
        }

        return false
    })


    set('initGame', async () => {
        if (!chapter.game) {
            const board = new Board()
            board.initGame(chapter.currentGameState, {
                artifactFactory: chapter.artifactFactory,
                skillFactory:    chapter.skillFactory
            })

            chapter.game = board

            initGameHooks(chapter, board)

            return board
        }

        return false
    })


    set('startGame', async () => {
        const {game} = chapter

        if (game) {
            return await game.triggerAction('start')
        }

        return false
    })


    set('stateChange', () => {
        return true
    })


    set('gameWon', async (flow, board) => {
        return board
    })


    set('gameLost', async (flow, board) => {
        return board
    })


    set('restart', async (flow) => {
        delete chapter.game
        chapter.currentGameState = Object.assign({}, chapter.initialGameState)
        flow.enqueue('initGame')
        flow.enqueue('startGame')

        return true
    })


    return actionSet

}


function initGameHooks (chapter, board) {
    const {hook} = board.actionSet.getApi()

    hook('win', async () => {
        await chapter.triggerAction('gameWon', board)
    })

    hook('lose', async () => {
        await chapter.triggerAction('gameLost', board)
    })

    hook('digestAction', () => {
        chapter.triggerAction('stateChange')
    })
}
