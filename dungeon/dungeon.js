import Game from '../game/game.js'
import DungeonStage from './stages/dungeon_stage.js'
import manifest from './manifest.json' with {type: 'json'}


export default class Dungeon extends Game {

    static $name = 'dungeon'
    static manifest = manifest
    static ActionController = null

    static layers = [
        {
            name: 'game',
            type: 'webgl',
            pixelRatio: 1.5,
            backgroundColor: '#0a0a12'
        }
    ]

    static stages = {
        dungeon: DungeonStage
    }

    configureGame () {
        this.setStage('dungeon')
    }

}
