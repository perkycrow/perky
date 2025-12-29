import Game from '../game/game'
import World from './world'

import GameController from './controllers/game_controller'
import GameRenderer from './game_renderer'
import Snowman from './snowman'
import WaveProgressBar from './ui/wave_progress_bar'

import VignettePass from '../render/postprocessing/passes/vignette_pass'
import ColorGradePass from '../render/postprocessing/passes/color_grade_pass'

import manifest from './manifest'
import debug from '../core/debug'

debug.enableDebug()
window.debug = debug


export default class DefendTheDen extends Game {

    static $name = 'defendTheDen'
    static manifest = manifest

    constructor (params = {}) {
        const renderSystemConfig = {
            cameras: {
                main: {
                    unitsInView: {width: 7, height: 5}
                }
            },
            layers: [
                {
                    name: 'game',
                    type: 'webgl',
                    camera: 'main',
                    pixelRatio: 1.5,
                    backgroundColor: '#f9f9f9',
                    enableCulling: true
                },
                {
                    name: 'ui',
                    type: 'html',
                    camera: 'main',
                    pointerEvents: 'none'
                }
            ]
        }

        super({
            ...params,
            renderSystem: renderSystemConfig
        })
    }

    configureGame () {
        this.world = this.create(World)

        this.camera = this.renderSystem.getCamera('main')

        this.registerController('game', GameController)
        this.setActiveControllers(['game'])

        this.renderer = this.create(GameRenderer, {
            $id: 'renderer',
            world: this.world,
            game: this
        })

        const gameController = this.getController('game')
        gameController.world = this.world

        // Setup post-processing on game layer
        const gameLayer = this.getCanvas('game')
        const vignettePass = new VignettePass()
        vignettePass.setUniform('uIntensity', 1.0)
        vignettePass.setUniform('uSmoothness', 0.4)
        gameLayer.renderer.addPostPass(vignettePass)

        const colorGradePass = new ColorGradePass()
        colorGradePass.setUniform('uBrightness', 0.02)
        colorGradePass.setUniform('uContrast', 1.05)
        colorGradePass.setUniform('uSaturation', 1.1)
        gameLayer.renderer.addPostPass(colorGradePass)

        // TEMP: Debug controls for post-processing
        this._createPostProcessControls(vignettePass, colorGradePass)

        const uiLayer = this.getHTML('ui')
        const waveProgress = this.create(WaveProgressBar, {
            $id: 'waveProgress',
            gameController
        })
        waveProgress.mount(uiLayer)

        this.on('render', () => {
            this.renderer.render()
        })
    }

    onStart () {
        this.execute('spawnPlayer', {x: -2.5})

        this.world.create(Snowman, {
            $id: 'snowman',
            x: 2,
            y: 0
        })

        const gameController = this.getController('game')
        gameController.startWave(0)
    }


    // TEMP: Debug UI for post-processing
    _createPostProcessControls (vignettePass, colorGradePass) {
        const panel = document.createElement('div')
        panel.id = 'postprocess-debug'
        panel.innerHTML = `
            <style>
                #postprocess-debug {
                    position: fixed;
                    top: 10px;
                    right: 10px;
                    background: rgba(0,0,0,0.85);
                    padding: 12px;
                    border-radius: 8px;
                    font-family: monospace;
                    font-size: 11px;
                    color: #fff;
                    z-index: 9999;
                    min-width: 200px;
                }
                #postprocess-debug h4 { margin: 0 0 8px; color: #4ecdc4; }
                #postprocess-debug label { display: flex; align-items: center; gap: 6px; margin: 4px 0; }
                #postprocess-debug input[type="checkbox"] { accent-color: #4ecdc4; }
                #postprocess-debug input[type="range"] { width: 100%; accent-color: #4ecdc4; }
                #postprocess-debug .group { margin-bottom: 10px; padding-bottom: 8px; border-bottom: 1px solid #333; }
            </style>
            <h4>Post-Processing Debug</h4>
            <div class="group">
                <label><input type="checkbox" id="pp-vignette" checked> Vignette</label>
                <label>Intensity <input type="range" id="pp-vignette-intensity" min="0" max="200" value="100"></label>
                <label>Smoothness <input type="range" id="pp-vignette-smoothness" min="0" max="100" value="40"></label>
            </div>
            <div class="group">
                <label><input type="checkbox" id="pp-colorgrade" checked> Color Grade</label>
                <label>Brightness <input type="range" id="pp-brightness" min="-50" max="50" value="2"></label>
                <label>Contrast <input type="range" id="pp-contrast" min="50" max="150" value="105"></label>
                <label>Saturation <input type="range" id="pp-saturation" min="0" max="200" value="110"></label>
            </div>
        `
        document.body.appendChild(panel)

        document.getElementById('pp-vignette').addEventListener('change', (e) => {
            vignettePass.enabled = e.target.checked
        })
        document.getElementById('pp-vignette-intensity').addEventListener('input', (e) => {
            vignettePass.setUniform('uIntensity', e.target.value / 100)
        })
        document.getElementById('pp-vignette-smoothness').addEventListener('input', (e) => {
            vignettePass.setUniform('uSmoothness', e.target.value / 100)
        })
        document.getElementById('pp-colorgrade').addEventListener('change', (e) => {
            colorGradePass.enabled = e.target.checked
        })
        document.getElementById('pp-brightness').addEventListener('input', (e) => {
            colorGradePass.setUniform('uBrightness', e.target.value / 100)
        })
        document.getElementById('pp-contrast').addEventListener('input', (e) => {
            colorGradePass.setUniform('uContrast', e.target.value / 100)
        })
        document.getElementById('pp-saturation').addEventListener('input', (e) => {
            colorGradePass.setUniform('uSaturation', e.target.value / 100)
        })
    }

}

