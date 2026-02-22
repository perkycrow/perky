import Game from '../game/game.js'
import MenuStage from './stages/menu_stage.js'
import ChapterStage from './stages/chapter_stage.js'
import InterludeStage from './stages/interlude_stage.js'
import SettingsStage from './stages/settings_stage.js'
import StoryAdventure from './adventures/story_adventure.js'
import manifest from './manifest.js'


const SAVE_KEY = 'mistbrewer_story'
const VOLUME_KEY = 'mistbrewer_volume'
const KEYBINDS_KEY = 'mistbrewer_keybinds'


export default class MistGame extends Game {

    static $name = 'mistGame'
    static manifest = manifest

    static camera = {unitsInView: {width: 26, height: 15}}
    static layer = {type: 'webgl', backgroundColor: 'transparent', pixelRatio: 1}
    static stages = {
        menu: MenuStage,
        chapter: ChapterStage,
        interlude: InterludeStage,
        settings: SettingsStage
    }

    adventure = null

    configureGame () {
        loadVolume(this)
        this.setStage('menu')
    }


    startAdventure () {
        this.adventure = new StoryAdventure()
        this.#bindAdventureHooks()
        this.adventure.triggerAction('start')
    }


    continueAdventure () {
        const data = loadJSON(SAVE_KEY)

        if (!data) {
            this.startAdventure()
            return
        }

        this.adventure = new StoryAdventure(data)
        this.#bindAdventureHooks()
        this.adventure.triggerAction('start')
    }


    hasSave () {
        return loadJSON(SAVE_KEY) !== null
    }


    clearSave () {
        localStorage.removeItem(SAVE_KEY)
        localStorage.removeItem(VOLUME_KEY)
        localStorage.removeItem(KEYBINDS_KEY)
    }


    saveVolume (global, music, sfx) {
        saveJSON(VOLUME_KEY, {global, music, sfx})
    }


    loadKeybinds () {
        return loadJSON(KEYBINDS_KEY)
    }


    saveKeybinds (bindings) {
        saveJSON(KEYBINDS_KEY, bindings)
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

        adventure.actionSet.hook('stateChange', () => {
            saveJSON(SAVE_KEY, adventure.export())
        })

        adventure.actionSet.hook('end', () => {
            this.adventure = null
            localStorage.removeItem(SAVE_KEY)
            this.setStage('menu')
        })
    }

}


function loadVolume (game) {
    const data = loadJSON(VOLUME_KEY)

    if (!data) {
        return
    }

    if (data.global !== undefined) {
        game.setVolume(data.global)
    }

    const audio = game.audioSystem

    if (!audio) {
        return
    }

    if (data.music !== undefined) {
        audio.setChannelVolume('music', data.music)
    }

    if (data.sfx !== undefined) {
        audio.setChannelVolume('sfx', data.sfx)
    }
}


function saveJSON (key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value))
    } catch (_e) {
        // localStorage full or unavailable
    }
}


function loadJSON (key) {
    try {
        const raw = localStorage.getItem(key)
        return raw ? JSON.parse(raw) : null
    } catch (_e) {
        return null
    }
}
