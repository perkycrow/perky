import BaseTool from './base_tool.js'
import {ICONS} from '../devtools_icons.js'
import '../../perky_explorer.js'


export default class ExplorerTool extends BaseTool {

    static toolId = 'explorer'
    static toolName = 'Explorer'
    static toolIcon = ICONS.explorer
    static location = 'sidebar'
    static order = 10

    static styles = `
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

    #explorerEl = null

    onConnected () {
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


    getHeaderActions () {
        return [
            {
                icon: ICONS.layers,
                title: this.#explorerEl?.showSystemModules ? 'Hide system modules' : 'Show system modules',
                active: this.#explorerEl?.showSystemModules || false,
                onClick: () => {
                    if (this.#explorerEl) {
                        this.#explorerEl.showSystemModules = !this.#explorerEl.showSystemModules
                    }
                }
            }
        ]
    }


    #buildDOM () {
        this.#explorerEl = document.createElement('perky-explorer')
        this.#explorerEl.embedded = true
        this.#explorerEl.addEventListener('inspect', () => this.state?.openLogger())
        this.#explorerEl.addEventListener('showSystemModules:change', () => {
            this.dispatchEvent(new CustomEvent('headeractions:change', {bubbles: true, composed: true}))
        })

        this.shadowRoot.appendChild(this.#explorerEl)

        if (this.state?.module) {
            this.#explorerEl.setModule(this.state.module)
        }
    }

}


ExplorerTool.register()


customElements.define('explorer-tool', ExplorerTool)
