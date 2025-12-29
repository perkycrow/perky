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

        this.#loggerButton = this.#createDockButton(
            '<svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>',
            'Logger',
            () => {
                this.#state?.toggleLogger()
            }
        )
        this.#dockEl.appendChild(this.#loggerButton)

        this.#spotlightButton = this.#createDockButton(
            '<svg viewBox="0 0 24 24"><polyline points="4 17 10 11 4 5"></polyline><line x1="12" y1="19" x2="20" y2="19"></line></svg>',
            'Spotlight (Cmd+K)',
            () => {
                this.#state?.toggleSpotlight()
            }
        )
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
        button.innerHTML = icon
        button.title = title
        button.addEventListener('click', onClick)
        return button
    }


    #updateActiveStates () {
        const activeTool = this.#state?.activeTool
        const sidebarOpen = this.#state?.sidebarOpen

        this.#dockEl.classList.toggle('sidebar-open', sidebarOpen)

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
