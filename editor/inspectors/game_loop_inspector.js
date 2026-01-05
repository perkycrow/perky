import BaseInspector from './base_inspector.js'
import PerkyExplorerDetails from '../perky_explorer_details.js'
import GameLoop from '../../game/game_loop.js'


const customStyles = `
    .fps-controls {
        grid-column: 1 / -1;
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-top: 8px;
        padding-top: 8px;
        border-top: 1px solid var(--border);
    }

    .fps-limit-row {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .fps-limit-checkbox {
        width: 14px;
        height: 14px;
        accent-color: var(--accent);
        cursor: pointer;
    }

    .fps-limit-label {
        color: var(--fg-secondary);
        font-size: 11px;
        cursor: pointer;
        user-select: none;
    }

    .fps-slider-row {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .fps-slider {
        flex: 1;
        height: 4px;
        accent-color: var(--accent);
        cursor: pointer;
    }

    .fps-slider:disabled {
        opacity: 0.4;
        cursor: not-allowed;
    }

    .fps-slider-value {
        min-width: 32px;
        color: var(--fg-secondary);
        font-size: 11px;
        text-align: right;
    }
`


export default class GameLoopInspector extends BaseInspector {

    static matches (module) {
        return module instanceof GameLoop
    }

    #fpsValueEl = null
    #screenFpsValueEl = null
    #statusValueEl = null
    #toggleBtn = null
    #fpsLimitCheckbox = null
    #fpsSlider = null
    #fpsSliderValue = null

    constructor () {
        super(customStyles)
        this.buildDOM()
    }


    onModuleSet (module) {
        if (module) {
            this.#bindEvents()
            this.#updateAll()
        }
    }


    buildDOM () {
        super.buildDOM()

        this.#fpsValueEl = this.addRow('fps', '0')
        this.#screenFpsValueEl = this.addRow('screen fps', '0')
        this.#statusValueEl = this.addRow('status', 'stopped')

        const controlsEl = document.createElement('div')
        controlsEl.className = 'fps-controls'

        const limitRow = document.createElement('div')
        limitRow.className = 'fps-limit-row'

        this.#fpsLimitCheckbox = document.createElement('input')
        this.#fpsLimitCheckbox.type = 'checkbox'
        this.#fpsLimitCheckbox.className = 'fps-limit-checkbox'
        this.#fpsLimitCheckbox.id = 'fps-limit-checkbox'
        this.#fpsLimitCheckbox.addEventListener('change', () => this.#handleLimitChange())

        const limitLabel = document.createElement('label')
        limitLabel.className = 'fps-limit-label'
        limitLabel.htmlFor = 'fps-limit-checkbox'
        limitLabel.textContent = 'Limit FPS'

        limitRow.appendChild(this.#fpsLimitCheckbox)
        limitRow.appendChild(limitLabel)

        const sliderRow = document.createElement('div')
        sliderRow.className = 'fps-slider-row'

        this.#fpsSlider = document.createElement('input')
        this.#fpsSlider.type = 'range'
        this.#fpsSlider.className = 'fps-slider'
        this.#fpsSlider.min = '15'
        this.#fpsSlider.max = '144'
        this.#fpsSlider.value = '60'
        this.#fpsSlider.addEventListener('input', () => this.#handleSliderChange())

        this.#fpsSliderValue = document.createElement('span')
        this.#fpsSliderValue.className = 'fps-slider-value'
        this.#fpsSliderValue.textContent = '60'

        sliderRow.appendChild(this.#fpsSlider)
        sliderRow.appendChild(this.#fpsSliderValue)

        controlsEl.appendChild(limitRow)
        controlsEl.appendChild(sliderRow)
        this.gridEl.appendChild(controlsEl)

        this.#toggleBtn = this.createButton('⏸', 'Pause', () => this.#handleToggle())
        this.actionsEl.appendChild(this.#toggleBtn)
    }


    #handleToggle () {
        if (!this.module) {
            return
        }

        if (this.module.paused) {
            this.module.resume()
        } else {
            this.module.pause()
        }
    }


    #handleLimitChange () {
        if (!this.module) {
            return
        }

        this.module.setFpsLimited(this.#fpsLimitCheckbox.checked)
        this.#updateSliderState()
    }


    #handleSliderChange () {
        if (!this.module) {
            return
        }

        const fps = parseInt(this.#fpsSlider.value, 10)
        this.module.setFps(fps)
        this.#fpsSliderValue.textContent = fps
    }


    #bindEvents () {
        if (!this.module) {
            return
        }

        this.listenTo(this.module, 'render', (_, fps, screenFps) => this.#updateFps(fps, screenFps))
        this.listenTo(this.module, 'pause', () => this.#updateStatus())
        this.listenTo(this.module, 'resume', () => this.#updateStatus())
        this.listenTo(this.module, 'start', () => this.#updateStatus())
        this.listenTo(this.module, 'stop', () => this.#updateStatus())
        this.listenTo(this.module, 'changed:fps', fps => this.#updateSlider(fps))
        this.listenTo(this.module, 'changed:fpsLimited', () => this.#updateSliderState())
    }


    #updateAll () {
        this.#updateFps(this.module?.getCurrentFps() || 0, this.module?.getScreenFps() || 0)
        this.#updateStatus()
        this.#updateSlider(this.module?.fps || 60)
        this.#updateSliderState()
    }


    #updateFps (fps, screenFps) {
        this.#fpsValueEl.textContent = fps
        this.#fpsValueEl.className = 'inspector-value accent'
        this.#screenFpsValueEl.textContent = screenFps
        this.#screenFpsValueEl.className = 'inspector-value'
    }


    #updateSlider (fps) {
        this.#fpsSlider.value = fps
        this.#fpsSliderValue.textContent = fps
    }


    #updateSliderState () {
        if (!this.module) {
            return
        }

        const isLimited = this.module.fpsLimited
        this.#fpsLimitCheckbox.checked = isLimited
        this.#fpsSlider.disabled = !isLimited
    }


    #updateStatus () { // eslint-disable-line complexity -- clean
        if (!this.module) {
            return
        }

        const {started, paused} = this.module
        let status = 'stopped'
        let statusClass = ''

        if (started && !paused) {
            status = 'running'
            statusClass = 'running'
        } else if (started && paused) {
            status = 'paused'
            statusClass = 'paused'
        }

        this.#statusValueEl.textContent = status
        this.#statusValueEl.className = `inspector-value ${statusClass}`

        this.#toggleBtn.disabled = !started

        if (started && !paused) {
            this.#toggleBtn.textContent = '⏸ Pause'
            this.#toggleBtn.classList.add('primary')
        } else if (started && paused) {
            this.#toggleBtn.textContent = '▶ Resume'
            this.#toggleBtn.classList.remove('primary')
        } else {
            this.#toggleBtn.textContent = '⏸ Pause'
            this.#toggleBtn.classList.remove('primary')
        }
    }

}


customElements.define('game-loop-inspector', GameLoopInspector)

PerkyExplorerDetails.registerInspector(GameLoopInspector)
