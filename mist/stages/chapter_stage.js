import Stage from '../../game/stage.js'
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
