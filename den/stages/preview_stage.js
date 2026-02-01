import DenStage from './den_stage.js'
import DenController from '../controllers/den_controller.js'
import PreviewControls from '../ui/preview_controls.js'


export default class PreviewStage extends DenStage {

    static ActionController = DenController

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
