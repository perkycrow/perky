import BaseEditorComponent from '../base_editor_component.js'
import {buildDockStyles} from './devtools_styles.js'
import {getSidebarTools} from './devtools_registry.js'


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
        state.addEventListener('sidebar:open', () => this.#updateActiveStates())
        state.addEventListener('sidebar:close', () => this.#updateActiveStates())
        state.addEventListener('logger:open', () => this.#updateLoggerState())
        state.addEventListener('logger:close', () => this.#updateLoggerState())
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




        crowBtn.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M10 5 L14 5"/>
                <path d="M11 5 L11.5 2.5 H13.5 L13 5"/>
                <circle cx="10" cy="10" r="2" />
                <path d="M 12 5 C 9 5 8 7 8 9" />
                <path d="M 8 9 L 3 11 L 8 13" />
                <path d="M 8 13 C 9 16 11 19 14 21" />
                <path d="M 14 5 C 16 6 17 12 17 20" />
            </svg>
        `

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
            '<svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>',
            'Logger',
            () => {
                this.#state?.toggleLogger()
            }
        )
        this.#dockEl.appendChild(this.#loggerButton)


        this.#commandPaletteButton = createDockButton(
            '<svg viewBox="0 0 24 24"><polyline points="4 17 10 11 4 5"></polyline><line x1="12" y1="19" x2="20" y2="19"></line></svg>',
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
            '<svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"></polyline></svg>',
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
