import BaseInspector from './base_inspector.js'
import PerkyExplorerDetails from '../perky_explorer_details.js'
import GameLoop from '../../game/game_loop.js'


export default class GameLoopInspector extends BaseInspector {

    static matches (module) {
        return module instanceof GameLoop
    }

    #fpsValueEl = null
    #statusValueEl = null
    #toggleBtn = null


    constructor () {
        super()
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
        this.#statusValueEl = this.addRow('status', 'stopped')
        this.addRow('target fps', () => this.module?.fps || 60)

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


    #bindEvents () {
        if (!this.module) {
            return
        }

        this.listenTo(this.module, 'render', (_, fps) => this.#updateFps(fps))
        this.listenTo(this.module, 'pause', () => this.#updateStatus())
        this.listenTo(this.module, 'resume', () => this.#updateStatus())
        this.listenTo(this.module, 'start', () => this.#updateStatus())
        this.listenTo(this.module, 'stop', () => this.#updateStatus())
    }


    #updateAll () {
        this.#updateFps(this.module?.getCurrentFps() || 0)
        this.#updateStatus()
    }


    #updateFps (fps) {
        this.#fpsValueEl.textContent = fps
        this.#fpsValueEl.className = 'inspector-value accent'
    }


    #updateStatus () { // eslint-disable-line complexity
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
