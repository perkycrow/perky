import Game from '../game/game.js'

import ChromaticEffect from './effects/chromatic_effect.js'
import OutlineEffect from '../render/shaders/builtin/effects/outline_effect.js'
import WaveEffect from './effects/wave_effect.js'

import GameplayStage from './stages/gameplay_stage.js'
import PreviewStage from './stages/preview_stage.js'

import VignettePass from '../render/postprocessing/passes/vignette_pass.js'
import DayNightPass from './postprocessing/day_night_pass.js'

import manifest from './manifest.json' with { type: 'json' }


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
    static postPasses = [DayNightPass, VignettePass]
    static stages = {
        gameplay: GameplayStage,
        preview: PreviewStage
    }

    configureGame (params = {}) {
        const gameRenderer = this.getRenderer('game')
        gameRenderer.registerShaderEffect(ChromaticEffect)
        gameRenderer.registerShaderEffect(OutlineEffect)
        gameRenderer.registerShaderEffect(WaveEffect)

        const stageName = params.preview ? 'preview' : 'gameplay'
        this.setStage(stageName)
    }


    onStart () {
        super.onStart()
    }

}
