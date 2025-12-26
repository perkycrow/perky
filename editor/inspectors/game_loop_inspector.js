import {cssVariables, inspectorStyles} from '../components/perky_explorer_styles.js'


const styles = `
    :host {
        ${cssVariables}
        display: block;
    }

    ${inspectorStyles}
`


export default class GameLoopInspector extends HTMLElement {

    #module = null
    #gridEl = null
    #actionsEl = null
    #fpsValueEl = null
    #statusValueEl = null
    #toggleBtn = null
    #listeners = []


    constructor () {
        super()
        this.attachShadow({mode: 'open'})
        this.#buildDOM()
    }


    disconnectedCallback () {
        this.#unbindEvents()
    }


    setModule (module) {
        this.#unbindEvents()
        this.#module = module

        if (module) {
            this.#bindEvents()
            this.#updateAll()
        }
    }


    #buildDOM () {
        const style = document.createElement('style')
        style.textContent = styles
        this.shadowRoot.appendChild(style)

        this.#gridEl = document.createElement('div')
        this.#gridEl.className = 'inspector-grid'

        this.#fpsValueEl = this.#addRow('fps', '0')
        this.#statusValueEl = this.#addRow('status', 'stopped')
        this.#addRow('target fps', () => this.#module?.fps || 60)

        this.#actionsEl = document.createElement('div')
        this.#actionsEl.className = 'inspector-actions'

        this.#toggleBtn = this.#createButton('⏸', 'Pause', () => this.#handleToggle())
        this.#actionsEl.appendChild(this.#toggleBtn)

        this.shadowRoot.appendChild(this.#gridEl)
        this.shadowRoot.appendChild(this.#actionsEl)
    }


    #addRow (label, value) {
        const labelEl = document.createElement('div')
        labelEl.className = 'inspector-label'
        labelEl.textContent = label

        const valueEl = document.createElement('div')
        valueEl.className = 'inspector-value'

        if (typeof value === 'function') {
            valueEl.textContent = value()
        } else {
            valueEl.textContent = value
        }

        this.#gridEl.appendChild(labelEl)
        this.#gridEl.appendChild(valueEl)

        return valueEl
    }


    #createButton (icon, text, onClick) {
        const btn = document.createElement('button')
        btn.className = 'inspector-btn'
        if (icon) {
            btn.textContent = `${icon} ${text}`
        } else {
            btn.textContent = text
        }
        btn.addEventListener('click', onClick)
        return btn
    }


    #handleToggle () {
        if (!this.#module) {
            return
        }

        if (this.#module.paused) {
            this.#module.resume()
        } else {
            this.#module.pause()
        }
    }


    #bindEvents () {
        if (!this.#module) {
            return
        }

        this.#addListener(this.#module, 'render', (_, fps) => this.#updateFps(fps))
        this.#addListener(this.#module, 'pause', () => this.#updateStatus())
        this.#addListener(this.#module, 'resume', () => this.#updateStatus())
        this.#addListener(this.#module, 'start', () => this.#updateStatus())
        this.#addListener(this.#module, 'stop', () => this.#updateStatus())
    }


    #addListener (target, event, handler) {
        target.on(event, handler)
        this.#listeners.push({target, event, handler})
    }


    #unbindEvents () {
        for (const {target, event, handler} of this.#listeners) {
            target.off(event, handler)
        }
        this.#listeners = []
    }


    #updateAll () {
        this.#updateFps(this.#module?.getCurrentFps() || 0)
        this.#updateStatus()
    }


    #updateFps (fps) {
        this.#fpsValueEl.textContent = fps
        this.#fpsValueEl.className = 'inspector-value accent'
    }


    #updateStatus () {
        if (!this.#module) {
            return
        }

        const {started, paused} = this.#module
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
