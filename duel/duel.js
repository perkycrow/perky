import Game from '../game/game.js'
import ArenaStage from './stages/arena_stage.js'
import manifest from './manifest.json' with {type: 'json'}


export default class Duel extends Game {

    static $name = 'duel'
    static manifest = manifest
    static ActionController = null

    static camera = {unitsInView: {width: 16, height: 9}}
    static layers = [
        {
            name: 'game',
            type: 'webgl',
            camera: 'main',
            pixelRatio: 1.5,
            backgroundColor: '#2a2a3a'
        }
    ]
    static stages = {
        arena: ArenaStage
    }

    configureGame () {
        this.setStage('arena')
    }

}
