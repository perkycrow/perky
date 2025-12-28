import BaseTool from './base_tool.js'
import '../../perky_explorer.js'


export default class ExplorerTool extends BaseTool {

    static toolId = 'explorer'
    static toolName = 'Explorer'
    static toolIcon = '\uD83D\uDCE6'
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
        overflow: hidden;
    }

    perky-explorer {
        height: 100%;
    }
`


ExplorerTool.register()


customElements.define('explorer-tool', ExplorerTool)
