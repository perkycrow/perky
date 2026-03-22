import Stage from '../../game/stage.js'
import ChapterWorld from '../worlds/chapter_world.js'
import ChapterController from '../controllers/chapter_controller.js'
import VignettePass from '../../render/postprocessing/passes/vignette_pass.js'
import ColorGradePass from '../../render/postprocessing/passes/color_grade_pass.js'
import Easing from '../../math/easing.js'
import wiring from '../wiring.js'


const FADE_DURATION = 0.5
const BASE_PPU = 57


export default class ChapterStage extends Stage {

    static World = ChapterWorld
    static ActionController = ChapterController
    static postPasses = [VignettePass, ColorGradePass]

    #fadeTimer = 0

    onStart () {
        super.onStart()
        wiring.registerViews(this)

        this.game.getLayer('game').setContent(this.viewsGroup)
        this.game.createLayer('chapterUI', 'html', {
            camera: this.game.camera,
            pointerEvents: 'none',
            basePpu: BASE_PPU
        })

        const sceneConfig = this.game.manifest?.getAsset('chapterScene')?.source
        if (sceneConfig) {
            this.world.loadLayout(sceneConfig, wiring)
        }

        this.world.init(this.game, {
            chapter: this.options.chapter,
            adventure: this.options.adventure
        })

        this.#configurePostPasses()
        this.#fadeTimer = FADE_DURATION
        this.game.getLayer('game').opacity = 0
    }


    onStop () {
        super.onStop()
        this.game.getLayer('game').opacity = 1

        const layer = this.game.getLayer('chapterUI')

        if (layer) {
            this.game.removeLayer('chapterUI')
        }
    }


    update (deltaTime) {
        this.world.syncBoard()
        this.#updateHover()
        this.#updateFade(deltaTime)
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


    #updateFade (deltaTime) {
        if (this.#fadeTimer <= 0) {
            return
        }

        this.#fadeTimer -= deltaTime
        const progress = 1 - Math.max(0, this.#fadeTimer / FADE_DURATION)
        this.game.getLayer('game').opacity = Easing.easeOutCubic(progress)
    }


    #configurePostPasses () {
        const renderer = this.game.getRenderer('game')

        if (!renderer) {
            return
        }

        for (const pass of renderer.postPasses) {
            if (pass instanceof VignettePass) {
                pass.setUniform('uIntensity', 0.5)
                pass.setUniform('uSmoothness', 0.9)
                pass.setUniform('uColor', [0.08, 0.04, 0.02])
            }

            if (pass instanceof ColorGradePass) {
                pass.setUniform('uSaturation', 0.85)
                pass.setUniform('uBrightness', -0.03)
            }
        }
    }


    render () {
        this.syncViews()
    }

}
