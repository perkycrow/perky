import Game from '../game/game.js'
import SurvivalStage from './stages/survival_stage.js'
import manifest from './manifest.json' with {type: 'json'}


export default class Hollow extends Game {

    static $name = 'hollow'
    static manifest = manifest
    static ActionController = null

    static camera = {unitsInView: {width: 16, height: 16}}
    static layers = [
        {
            name: 'game',
            type: 'webgl',
            camera: 'main',
            pixelRatio: 1.5,
            backgroundColor: '#1a2a1a'
        }
    ]
    static stages = {
        survival: SurvivalStage
    }

    configureGame () {
        this.setStage('survival')
    }

}
