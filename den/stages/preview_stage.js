import GameStage from './game_stage.js'
import PreviewControls from '../ui/preview_controls.js'


export default class PreviewStage extends GameStage {

    static $name = 'preview'

    onStart () {
        super.onStart()

        this.#createUI()
    }


    #createUI () {
        const uiLayer = this.game.getHTML('ui')

        const previewControls = this.create(PreviewControls, {
            $id: 'previewControls',
            game: this.game,
            stage: this
        })
        previewControls.mount(uiLayer)
    }

}
