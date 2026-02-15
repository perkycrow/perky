import Random from '../../math/random.js'
import Board from './board.js'
import Lab from './lab.js'
import Workshop from './workshop.js'
import Arsenal from './arsenal.js'
import Vault from './vault.js'
import createGameActionSet from '../action_sets/game_action_set.js'


export default class Game {

    constructor (params, {artifactFactory, skillFactory} = {}) {
        this.artifactFactory = artifactFactory || this.constructor.artifactFactory
        this.skillFactory    = skillFactory    || this.constructor.skillFactory

        this.restore(params)

        this.actionSet    = createGameActionSet(this)
        this.initialState = this.export()
    }


    get randomState () {
        return this.random.getState()
    }


    set randomState (randomState) {
        this.random.setState(randomState)
    }


    weightedChoice (choices) {
        return this.random.weightedChoice(choices)
    }


    get score () {
        return this.digest.score || 0
    }


    async triggerUserAction (name, ...args) {
        const {actionSet} = this

        if (canTriggerAction(this, name)) {
            this.busy = true
            const flow = await actionSet.trigger(name, ...args)
            this.busy = false

            return flow
        }

        return false
    }


    async triggerAction (name, ...args) {
        return await this.actionSet.trigger(name, ...args)
    }


    restore (params) {
        reset(this, params)
    }


    export () {
        return {
            id:          this.id,
            seed:        this.seed,
            randomState: this.randomState,
            board:       this.board.export(),
            lab:         this.lab.export(),
            workshop:    this.workshop.export(),
            arsenal:     this.arsenal.export(),
            vault:       this.vault.export(),
            ended:       this.ended,
            saved:       this.saved,
            digest:      Object.assign({}, this.digest)
        }
    }

}


function canTriggerAction (game, name) {
    return !game.busy
        && !game.ended
        && (game.started || name === 'start')
}


function reset (game, {
    id   = Random.generateSeed(),
    seed = Random.generateSeed(),
    randomState,
    board,
    lab,
    workshop,
    arsenal,
    vault,
    ended    = false,
    saved    = false,
    digest   = {}
} = {}) {
    game.id = id

    game.seed = seed
    game.random = new Random(game.seed)

    if (randomState) {
        game.randomState = randomState
    }

    game.board    = new Board(board)
    game.lab      = new Lab(lab)
    game.workshop = new Workshop(workshop)
    game.arsenal  = new Arsenal(arsenal, game.skillFactory)
    game.vault    = new Vault(vault, game.artifactFactory)
    game.ended    = ended
    game.saved    = saved
    game.digest   = digest
}
