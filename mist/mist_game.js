import Game from '../game/game.js'
import MenuStage from './stages/menu_stage.js'
import ChapterStage from './stages/chapter_stage.js'
import InterludeStage from './stages/interlude_stage.js'
import StoryAdventure from './adventures/story_adventure.js'
import manifest from './manifest.js'


export default class MistGame extends Game {

    static $name = 'mistGame'
    static manifest = manifest

    static camera = {unitsInView: {width: 26, height: 15}}
    static layer = {type: 'webgl', backgroundColor: 'transparent', pixelRatio: 1}
    static stages = {
        menu: MenuStage,
        chapter: ChapterStage,
        interlude: InterludeStage
    }

    adventure = null

    configureGame () {
        this.setStage('menu')
    }


    startAdventure () {
        this.adventure = new StoryAdventure()
        this.#bindAdventureHooks()
        this.adventure.triggerAction('start')
    }


    restartChapter () {
        if (!this.adventure) {
            return
        }

        const step = this.adventure.currentStep

        if (step && step.type === 'chapter') {
            delete step.game
            step.restart()
            this.setStage('chapter', {chapter: step, adventure: this.adventure})
        }
    }


    nextStep () {
        if (!this.adventure) {
            return
        }

        const step = this.adventure.currentStep

        if (step) {
            step.triggerAction('end')
        }
    }


    #bindAdventureHooks () {
        const adventure = this.adventure

        adventure.actionSet.hook('initStep', (_flow, step) => {
            if (!step) {
                return
            }

            if (step.type === 'chapter') {
                this.setStage('chapter', {chapter: step, adventure})
            } else if (step.type === 'interlude') {
                this.setStage('interlude', {interlude: step, adventure})
            }
        })

        adventure.actionSet.hook('startStep', (_flow, step) => {
            if (step && step.type === 'cutScene') {
                step.triggerAction('end')
            }
        })

        adventure.actionSet.hook('end', () => {
            this.adventure = null
            this.setStage('menu')
        })
    }

}
