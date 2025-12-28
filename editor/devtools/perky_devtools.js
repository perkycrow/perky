import BaseEditorComponent from '../base_editor_component.js'
import DevToolsState from './devtools_state.js'
import './devtools_dock.js'
import './devtools_sidebar.js'
import '../perky_logger.js'


export default class PerkyDevTools extends BaseEditorComponent {

    #state = new DevToolsState()
    #dockEl = null
    #sidebarEl = null
    #loggerEl = null
    #spotlightEl = null
    #keyboardHandler = null


    get state () {
        return this.#state
    }


    get logger () {
        return this.#loggerEl
    }


    connectedCallback () {
        this.#buildDOM()
        this.#setupKeyboard()
    }


    disconnectedCallback () {
        super.disconnectedCallback()
        this.#cleanupKeyboard()
    }


    setModule (module) {
        this.#state.setModule(module)
    }


    setAppManager (appManager) {
        this.#state.setAppManager(appManager)
    }


    openTool (toolId) {
        this.#state.openTool(toolId)
    }


    closeSidebar () {
        this.#state.closeSidebar()
    }


    toggleLogger () {
        this.#state.toggleLogger()
    }


    toggleSpotlight () {
        this.#state.toggleSpotlight()
    }


    #buildDOM () {
        const style = document.createElement('style')
        style.textContent = STYLES
        this.shadowRoot.appendChild(style)

        this.#dockEl = document.createElement('devtools-dock')
        this.#dockEl.setState(this.#state)

        this.#sidebarEl = document.createElement('devtools-sidebar')
        this.#sidebarEl.setState(this.#state)

        this.#loggerEl = document.createElement('perky-logger')
        this.#loggerEl.classList.add('devtools-logger', 'hidden')

        this.#state.addEventListener('logger:open', () => {
            this.#loggerEl.classList.remove('hidden')
        })

        this.#state.addEventListener('logger:close', () => {
            this.#loggerEl.classList.add('hidden')
        })

        this.#state.addEventListener('spotlight:open', () => {
            this.#showSpotlight()
        })

        this.#state.addEventListener('spotlight:close', () => {
            this.#hideSpotlight()
        })

        this.shadowRoot.appendChild(this.#dockEl)
        this.shadowRoot.appendChild(this.#sidebarEl)
        this.shadowRoot.appendChild(this.#loggerEl)
    }


    #setupKeyboard () {
        this.#keyboardHandler = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault()
                this.#state.toggleSpotlight()
            }

            if (e.key === 'Escape' && this.#state.spotlightOpen) {
                e.preventDefault()
                this.#state.closeSpotlight()
            }
        }

        document.addEventListener('keydown', this.#keyboardHandler)
    }


    #cleanupKeyboard () {
        if (this.#keyboardHandler) {
            document.removeEventListener('keydown', this.#keyboardHandler)
            this.#keyboardHandler = null
        }
    }


    async #showSpotlight () {
        if (!this.#spotlightEl) {
            const {default: DevToolsSpotlight} = await import('./devtools_spotlight.js')
            this.#spotlightEl = new DevToolsSpotlight()
            this.#spotlightEl.setState(this.#state)
            this.shadowRoot.appendChild(this.#spotlightEl)
        }
        this.#spotlightEl.show()
    }


    #hideSpotlight () {
        this.#spotlightEl?.hide()
    }


    refreshTools () {
        this.#dockEl?.refreshTools()
    }

}


const STYLES = `
    :host {
        display: contents;
    }

    .devtools-logger {
        position: fixed;
        bottom: 10px;
        left: 10px;
        right: 60px;
        z-index: 9997;
    }

    .devtools-logger.hidden {
        display: none;
    }
`


customElements.define('perky-devtools', PerkyDevTools)
