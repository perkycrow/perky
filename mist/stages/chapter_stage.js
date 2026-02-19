import Stage from '../../game/stage.js'
import Sprite from '../../render/sprite.js'
import ChapterWorld from '../worlds/chapter_world.js'
import ChapterController from '../controllers/chapter_controller.js'
import ReagentEntity from '../entities/reagent_entity.js'
import ReagentView from '../views/reagent_view.js'


export default class ChapterStage extends Stage {

    static World = ChapterWorld
    static ActionController = ChapterController

    onStart () {
        super.onStart()
        this.register(ReagentEntity, ReagentView)

        const frameImage = this.game.getSource('boardFrame')

        if (frameImage) {
            this.viewsGroup.addChild(new Sprite({
                image: frameImage,
                y: -0.5,
                width: 7,
                depth: -1
            }))
        }

        this.game.getLayer('game').setContent(this.viewsGroup)
        this.world.init()
    }


    update (deltaTime) {
        this.world.syncBoard()
        super.update(deltaTime)
    }


    render () {
        this.syncViews()
    }

}
