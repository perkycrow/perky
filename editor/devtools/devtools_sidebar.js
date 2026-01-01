import BaseEditorComponent from '../base_editor_component.js'
import {buildSidebarStyles} from './devtools_styles.js'
import {getTool} from './devtools_registry.js'


function createSidebarContent () {
    const content = document.createElement('div')
    content.className = 'sidebar-content'
    return content
}


export default class DevToolsSidebar extends BaseEditorComponent {

    #state = null
    #sidebarEl = null
    #headerEl = null
    #titleEl = null
    #titleIconEl = null
    #titleTextEl = null
    #closeBtn = null
    #contentEl = null
    #currentToolEl = null
    #currentToolId = null

    connectedCallback () {
        this.#buildDOM()
    }


    setState (state) {
        this.#state = state

        state.addEventListener('tool:change', (e) => {
            this.#loadTool(e.detail.toolId)
        })

        state.addEventListener('sidebar:open', () => {
            this.#show()
        })

        state.addEventListener('sidebar:close', () => {
            this.#hide()
        })

        if (state.sidebarOpen && state.activeTool) {
            this.#loadTool(state.activeTool)
            this.#show()
        }
    }


    #buildDOM () {
        const style = document.createElement('style')
        style.textContent = STYLES
        this.shadowRoot.appendChild(style)

        this.#sidebarEl = document.createElement('div')
        this.#sidebarEl.className = 'devtools-sidebar hidden'

        this.#headerEl = this.#createHeader()
        this.#contentEl = createSidebarContent()

        this.#sidebarEl.appendChild(this.#headerEl)
        this.#sidebarEl.appendChild(this.#contentEl)

        this.shadowRoot.appendChild(this.#sidebarEl)
    }


    #createHeader () {
        const header = document.createElement('div')
        header.className = 'sidebar-header'

        this.#titleEl = document.createElement('div')
        this.#titleEl.className = 'sidebar-title'

        this.#titleIconEl = document.createElement('span')
        this.#titleIconEl.className = 'sidebar-title-icon'

        this.#titleTextEl = document.createElement('span')

        this.#titleEl.appendChild(this.#titleIconEl)
        this.#titleEl.appendChild(this.#titleTextEl)

        this.#closeBtn = document.createElement('button')
        this.#closeBtn.className = 'sidebar-close'
        this.#closeBtn.textContent = '\u00D7'
        this.#closeBtn.title = 'Close'
        this.#closeBtn.addEventListener('click', () => {
            this.#state?.closeSidebar()
        })

        header.appendChild(this.#titleEl)
        header.appendChild(this.#closeBtn)

        return header
    }


    #loadTool (toolId) {
        if (this.#currentToolId === toolId && this.#currentToolEl) {
            return
        }

        if (this.#currentToolEl) {
            this.#currentToolEl.onDeactivate?.()
            this.#contentEl.removeChild(this.#currentToolEl)
            this.#currentToolEl = null
        }

        const Tool = getTool(toolId)
        if (!Tool) {
            console.warn(`Tool not found: ${toolId}`)
            return
        }

        this.#titleIconEl.innerHTML = Tool.toolIcon
        this.#titleTextEl.textContent = Tool.toolName

        this.#currentToolEl = new Tool()
        this.#currentToolEl.setState(this.#state)
        this.#currentToolId = toolId

        this.#contentEl.appendChild(this.#currentToolEl)
        this.#currentToolEl.onActivate?.()
    }


    #show () {
        this.#sidebarEl?.classList.remove('hidden')
    }


    #hide () {
        this.#sidebarEl?.classList.add('hidden')

        if (this.#currentToolEl) {
            this.#currentToolEl.onDeactivate?.()
        }
    }

}


const STYLES = buildSidebarStyles()


customElements.define('devtools-sidebar', DevToolsSidebar)
