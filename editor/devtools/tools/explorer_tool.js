import BaseTool from './base_tool.js'
import '../../perky_explorer.js'


export default class ExplorerTool extends BaseTool {

    static toolId = 'explorer'
    static toolName = 'Explorer'
    static toolIcon = '<svg viewBox="0 0 24 24"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>'
    static location = 'sidebar'
    static order = 10

    #explorerEl = null


    connectedCallback () {
        this.#buildDOM()
    }


    onStateSet (state) {
        if (this.#explorerEl && state.module) {
            this.#explorerEl.setModule(state.module)
        }

        state.addEventListener('module:change', (e) => {
            if (this.#explorerEl) {
                this.#explorerEl.setModule(e.detail.module)
            }
        })
    }


    onActivate () {
        if (this.#explorerEl && this.state?.module) {
            this.#explorerEl.setModule(this.state.module)
        }
    }


    #buildDOM () {
        const style = document.createElement('style')
        style.textContent = STYLES
        this.shadowRoot.appendChild(style)

        this.#explorerEl = document.createElement('perky-explorer')
        this.#explorerEl.embedded = true

        this.shadowRoot.appendChild(this.#explorerEl)

        if (this.state?.module) {
            this.#explorerEl.setModule(this.state.module)
        }
    }

}


const STYLES = `
    :host {
        display: block;
        height: 100%;
        overflow: auto;
    }

    :host::-webkit-scrollbar {
        width: 6px;
    }

    :host::-webkit-scrollbar-track {
        background: #1a1a1e;
    }

    :host::-webkit-scrollbar-thumb {
        background: #38383e;
        border-radius: 3px;
    }

    perky-explorer {
        height: auto;
    }
`


ExplorerTool.register()


customElements.define('explorer-tool', ExplorerTool)
