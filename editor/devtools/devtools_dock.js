import BaseEditorComponent from '../base_editor_component.js'
import {buildDockStyles} from './devtools_styles.js'
import {getSidebarTools} from './devtools_registry.js'
import {ICONS} from './devtools_icons.js'


function createDockButton (icon, title, onClick) {
    const button = document.createElement('button')
    button.className = 'dock-button'
    button.innerHTML = icon
    button.title = title
    button.addEventListener('click', onClick)
    return button
}


export default class DevToolsDock extends BaseEditorComponent {

    #state = null
    #dockEl = null
    #toolButtons = new Map()
    #loggerButton = null
    #commandPaletteButton = null


    #minimized = true

    connectedCallback () {
        this.#buildDOM()
    }


    setState (state) {
        this.#state = state

        state.addEventListener('tool:change', () => this.#updateActiveStates())
        state.addEventListener('sidebar:open', () => this.#expand())
        state.addEventListener('sidebar:close', () => this.#updateActiveStates())
        state.addEventListener('logger:open', () => this.#expand())
        state.addEventListener('logger:close', () => this.#updateLoggerState())
    }


    #expand () {
        if (this.#minimized) {
            this.#minimized = false
            this.#render()
        } else {
            this.#updateActiveStates()
            this.#updateLoggerState()
        }
    }


    refreshTools () {
        this.#render()
    }


    #buildDOM () {
        const style = document.createElement('style')
        style.textContent = STYLES
        this.shadowRoot.appendChild(style)

        this.#dockEl = document.createElement('div')
        this.#dockEl.className = 'devtools-dock'

        this.#render()

        this.shadowRoot.appendChild(this.#dockEl)
    }


    #render () {
        if (!this.#dockEl) {
            return
        }

        this.#dockEl.innerHTML = ''
        this.#toolButtons.clear()
        this.#dockEl.classList.toggle('minimized', this.#minimized)

        if (this.#minimized) {
            this.#renderMinimized()
        } else {
            this.#renderExpanded()
        }
    }


    #renderMinimized () {
        const crowBtn = createDockButton(
            '',
            'Open DevTools',
            () => {
                this.#minimized = false
                this.#render()


                this.#state?.toggleTool('explorer')
                if (!this.#state?.sidebarOpen) {
                    this.#state?.toggleSidebar()
                }
            }
        )




        crowBtn.innerHTML = ICONS.crow

        this.#dockEl.appendChild(crowBtn)
    }


    #renderExpanded () {
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


        this.#loggerButton = createDockButton(
            ICONS.logger,
            'Logger',
            () => {
                this.#state?.toggleLogger()
            }
        )
        this.#dockEl.appendChild(this.#loggerButton)


        this.#commandPaletteButton = createDockButton(
            ICONS.terminal,
            'Command Palette (Ctrl+K)',
            () => {
                this.#state?.toggleCommandPalette()
            }
        )
        this.#dockEl.appendChild(this.#commandPaletteButton)


        const separator2 = document.createElement('div')
        separator2.className = 'dock-separator'
        this.#dockEl.appendChild(separator2)


        const collapseBtn = createDockButton(
            ICONS.chevronLeft,
            'Collapse Dock',
            () => {
                this.#minimized = true
                this.#render()


                if (this.#state?.sidebarOpen) {
                    this.#state.closeSidebar()
                }
                if (this.#state?.loggerOpen) {
                    this.#state.closeLogger()
                }
            }
        )
        this.#dockEl.appendChild(collapseBtn)

        this.#updateActiveStates()
        this.#updateLoggerState()
    }


    #createToolButton (Tool) {
        const button = createDockButton(Tool.toolIcon, Tool.toolName, () => {
            this.#state?.toggleTool(Tool.toolId)
        })
        button.dataset.toolId = Tool.toolId
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
