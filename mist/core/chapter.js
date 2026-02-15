import ChapterActionSet from '../action_sets/chapter_action_set.js'
import {deepMerge} from '../libs/utils.js'


export default class Chapter {

    static reagentsCount = 6
    static unlockedCount = 3
    static startsAt      = 0


    constructor (params, {artifactFactory, skillFactory, arsenal, vault} = {}) {
        this.type            = 'chapter'
        this.artifactFactory = artifactFactory || this.constructor.artifactFactory
        this.skillFactory    = skillFactory    || this.constructor.skillFactory

        this.restore(Object.assign({arsenal, vault}, params))

        this.actionSet = new ChapterActionSet(this)
    }


    async triggerAction (name, ...args) {
        return this.actionSet.trigger(name, ...args)
    }


    async triggerUserAction (name, ...args) {
        const {actionSet} = this

        if (!this.busy) {
            this.busy = true
            const flow = await actionSet.trigger(name, ...args)
            this.busy = false

            return flow
        }

        return false
    }


    restart () {
        this.currentGameState = deepMerge({}, this.initialGameState)
    }


    restore (params) {
        reset(this, params)
    }


    export () {
        return {
            initialGameState: deepMerge({}, this.initialGameState),
            currentGameState: deepMerge({}, this.currentGameState)
        }
    }

}


function reset (chapter, {
    initialGameState = {},
    currentGameState,
    arsenal,
    vault
} = {}) {

    const gameParams = {
        lab: {
            reagentsCount: chapter.constructor.reagentsCount,
            unlockedCount: chapter.constructor.unlockedCount,
            startsAt:      chapter.constructor.startsAt
        }
    }

    if (arsenal) {
        gameParams.arsenal = arsenal.export()
    }

    if (vault) {
        gameParams.vault = vault.export()
    }

    chapter.initialGameState = deepMerge(gameParams, initialGameState)

    if (typeof currentGameState === 'undefined') {
        currentGameState = deepMerge({}, chapter.initialGameState)
    }

    Object.defineProperty(chapter, 'currentGameState', {
        configurable: true,
        get () {
            return chapter.game ? chapter.game.export() : currentGameState
        },
        set (value) {
            currentGameState = value
        }
    })
}
