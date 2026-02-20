import Stage from '../../game/stage.js'
import ChapterWorld from '../worlds/chapter_world.js'
import ChapterController from '../controllers/chapter_controller.js'
import {autoRegisterViews} from '../wiring.js'


export default class ChapterStage extends Stage {

    static World = ChapterWorld
    static ActionController = ChapterController

    onStart () {
        super.onStart()
        autoRegisterViews(this)

        this.game.getLayer('game').setContent(this.viewsGroup)
        this.game.createLayer('chapterUI', 'html', {
            camera: this.game.camera,
            pointerEvents: 'none'
        })
        this.world.init(this.game)
    }


    onStop () {
        super.onStop()
        const layer = this.game.getLayer('chapterUI')

        if (layer) {
            this.game.removeLayer('chapterUI')
        }
    }


    update (deltaTime) {
        this.world.syncBoard()
        this.#updateHover()
        super.update(deltaTime)
    }


    #updateHover () {
        const mousePos = this.game.getMouseValue('position')

        if (!mousePos) {
            return
        }

        const worldPos = this.game.camera.screenToWorld(mousePos.x, mousePos.y)
        const skillIndex = this.world.getSkillIndexAt(worldPos.x, worldPos.y)

        if (skillIndex >= 0) {
            this.world.skillMouseIn(skillIndex)
        } else {
            this.world.skillMouseOut()
        }
    }


    render () {
        this.syncViews()
    }

}
