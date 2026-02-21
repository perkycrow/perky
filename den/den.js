import Game from '../game/game.js'

import OutlineEffect from '../render/shaders/builtin/effects/outline_effect.js'

import GameplayStage from './stages/gameplay_stage.js'
import PreviewStage from './stages/preview_stage.js'

import manifest from './manifest.json' with { type: 'json' }
import wiring from './wiring.js'


export default class DefendTheDen extends Game {

    static $name = 'defendTheDen'
    static manifest = manifest
    static ActionController = null

    static camera = {unitsInView: {width: 7, height: 5}}
    static layers = [
        {
            name: 'game',
            type: 'webgl',
            camera: 'main',
            pixelRatio: 1.5,
            backgroundColor: '#000000',
            enableCulling: true
        },
        {
            name: 'ui',
            type: 'html',
            camera: 'main',
            pointerEvents: 'none'
        }
    ]
    static stages = {
        gameplay: GameplayStage,
        preview: PreviewStage
    }

    configureGame (params = {}) {
        const gameRenderer = this.getRenderer('game')
        wiring.registerEffects(gameRenderer)
        gameRenderer.registerShaderEffect(OutlineEffect)

        const stageName = params.preview ? 'preview' : 'gameplay'
        this.setStage(stageName)
    }


    onStart () {
        super.onStart()
    }

}
