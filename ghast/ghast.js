import Game from '../game/game.js'
import GhastStage from './stages/ghast_stage.js'
import manifest from './manifest.js'


export default class Ghast extends Game {

    static $name = 'ghast'
    static manifest = manifest

    static camera = {unitsInView: {width: 4.5, height: 4.5}}
    static layer = {type: 'webgl', backgroundColor: 'transparent', pixelRatio: 1}
    static stages = {ghast: GhastStage}

    configureGame () {
        this.setStage('ghast')

        this.on('update', () => {
            this.#updateCamera()
        })
    }


    #updateCamera () {
        const player = this.world?.player
        if (player) {
            this.camera.x = player.x
            this.camera.y = player.y
        }
    }

}
