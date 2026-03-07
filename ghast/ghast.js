import Game from '../game/game.js'
import GhastStage from './stages/ghast_stage.js'
import OutlineEffect from '../render/shaders/builtin/effects/outline_effect.js'
import manifest from './manifest.js'


export default class Ghast extends Game {

    static $name = 'ghast'
    static manifest = manifest

    static camera = {unitsInView: {width: 7, height: 6}}
    static layer = {type: 'webgl', backgroundColor: 'transparent', pixelRatio: 1}
    static stages = {ghast: GhastStage}

    configureGame () {
        const gameRenderer = this.getRenderer('game')
        gameRenderer.registerShaderEffect(OutlineEffect)

        this.setStage('ghast')

        this.on('update', () => {
            this.#updateCamera()
        })
    }


    #updateCamera () {
        const shade = this.world?.shade
        if (shade) {
            this.camera.x = shade.x
            this.camera.y = shade.y
        }
    }

}
