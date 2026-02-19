import ActionSet from '../libs/action_set.js'
import Game from '../core/game.js'


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
            chapter.game = new Game(chapter.currentGameState, {
                artifactFactory: chapter.artifactFactory,
                skillFactory:    chapter.skillFactory
            })

            initGameHooks(chapter, chapter.game)

            return chapter.game
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


    set('gameWon', async (flow, game) => {
        return game
    })


    set('gameLost', async (flow, game) => {
        return game
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


function initGameHooks (chapter, game) {
    const {hook} = game.actionSet.getApi()

    hook('win', async () => {
        await chapter.triggerAction('gameWon', game)
    })

    hook('lose', async () => {
        await chapter.triggerAction('gameLost', game)
    })

    hook('digestAction', () => {
        chapter.triggerAction('stateChange')
    })
}
