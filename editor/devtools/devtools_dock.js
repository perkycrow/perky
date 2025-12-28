import BaseEditorComponent from '../base_editor_component.js'
import {buildDockStyles} from './devtools_styles.js'
import {getSidebarTools} from './devtools_registry.js'


export default class DevToolsDock extends BaseEditorComponent {

    #state = null
    #dockEl = null
    #toolButtons = new Map()
    #loggerButton = null
    #spotlightButton = null


    connectedCallback () {
        this.#buildDOM()
    }


    setState (state) {
        this.#state = state

        state.addEventListener('tool:change', () => this.#updateActiveStates())
        state.addEventListener('sidebar:open', () => this.#updateActiveStates())
        state.addEventListener('sidebar:close', () => this.#updateActiveStates())
        state.addEventListener('logger:open', () => this.#updateLoggerState())
        state.addEventListener('logger:close', () => this.#updateLoggerState())
    }


    refreshTools () {
        this.#rebuildToolButtons()
    }


    #buildDOM () {
        const style = document.createElement('style')
        style.textContent = STYLES
        this.shadowRoot.appendChild(style)

        this.#dockEl = document.createElement('div')
        this.#dockEl.className = 'devtools-dock'

        this.#rebuildToolButtons()

        this.shadowRoot.appendChild(this.#dockEl)
    }


    #rebuildToolButtons () {
        if (!this.#dockEl) {
            return
        }

        this.#dockEl.innerHTML = ''
        this.#toolButtons.clear()

        const tools = getSidebarTools()

        for (const Tool of tools) {
            const button = this.#createToolButton(Tool)
            this.#toolButtons.set(Tool.toolId, button)
            this.#dockEl.appendChild(button)
        }

        if (tools.length > 0) {
            const separator = document.createElement('div')
            separator.className = 'dock-separator'
            this.#dockEl.appendChild(separator)
        }

        this.#loggerButton = this.#createDockButton('\uD83D\uDCCB', 'Logger', () => {
            this.#state?.toggleLogger()
        })
        this.#dockEl.appendChild(this.#loggerButton)

        this.#spotlightButton = this.#createDockButton('\uD83D\uDD0D', 'Spotlight (Cmd+K)', () => {
            this.#state?.toggleSpotlight()
        })
        this.#dockEl.appendChild(this.#spotlightButton)

        this.#updateActiveStates()
        this.#updateLoggerState()
    }


    #createToolButton (Tool) {
        const button = this.#createDockButton(Tool.toolIcon, Tool.toolName, () => {
            this.#state?.toggleTool(Tool.toolId)
        })
        button.dataset.toolId = Tool.toolId
        return button
    }


    #createDockButton (icon, title, onClick) {
        const button = document.createElement('button')
        button.className = 'dock-button'
        button.textContent = icon
        button.title = title
        button.addEventListener('click', onClick)
        return button
    }


    #updateActiveStates () {
        const activeTool = this.#state?.activeTool
        const sidebarOpen = this.#state?.sidebarOpen

        for (const [toolId, button] of this.#toolButtons) {
            const isActive = sidebarOpen && activeTool === toolId
            button.classList.toggle('active', isActive)
        }
    }


    #updateLoggerState () {
        if (this.#loggerButton) {
            this.#loggerButton.classList.toggle('active', this.#state?.loggerOpen)
        }
    }

}


const STYLES = buildDockStyles()


customElements.define('devtools-dock', DevToolsDock)
