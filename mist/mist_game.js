import Game from '../game/game.js'
import ChapterStage from './stages/chapter_stage.js'
import manifest from './manifest.js'


export default class MistGame extends Game {

    static $name = 'mistGame'
    static manifest = manifest

    static camera = {unitsInView: {width: 26, height: 15}}
    static layer = {type: 'webgl', backgroundColor: 'transparent', pixelRatio: 1}
    static stages = {chapter: ChapterStage}

    configureGame () {
        this.setStage('chapter')
    }

}
