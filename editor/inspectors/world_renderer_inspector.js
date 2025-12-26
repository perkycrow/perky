import {cssVariables, inspectorStyles} from '../components/perky_explorer_styles.js'
import WorldRenderer from '../../render/world_renderer.js'


const styles = `
    :host {
        ${cssVariables}
        display: block;
    }

    ${inspectorStyles}

    .renderer-list {
        margin-top: 8px;
        padding-top: 8px;
        border-top: 1px solid var(--border);
    }

    .renderer-list-title {
        color: var(--fg-secondary);
        font-size: 10px;
        margin-bottom: 6px;
        text-transform: uppercase;
    }

    .renderer-item {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 4px 0;
        color: var(--fg-primary);
        font-size: 11px;
    }

    .renderer-count {
        color: var(--fg-muted);
        font-size: 10px;
    }
`


export default class WorldRendererInspector extends HTMLElement {

    static matches (module) {
        return module instanceof WorldRenderer
    }

    #module = null
    #gridEl = null
    #actionsEl = null


    constructor () {
        super()
        this.attachShadow({mode: 'open'})
        this.#buildDOM()
    }


    setModule (module) {
        this.#module = module
        this.#update()
    }


    #buildDOM () {
        const style = document.createElement('style')
        style.textContent = styles
        this.shadowRoot.appendChild(style)

        this.#gridEl = document.createElement('div')
        this.#gridEl.className = 'inspector-grid'

        this.#actionsEl = document.createElement('div')
        this.#actionsEl.className = 'inspector-actions'

        this.shadowRoot.appendChild(this.#gridEl)
        this.shadowRoot.appendChild(this.#actionsEl)
    }


    #update () {
        if (!this.#module) {
            return
        }

        this.#gridEl.innerHTML = ''
        this.#actionsEl.innerHTML = ''

        const renderer = this.#module

        this.#addRow('world', renderer.world?.$id || '(none)')
        this.#addRow('game', renderer.game?.$id || '(none)')

        const entityCount = renderer.rootGroup?.children?.length ?? 0
        this.#addRow('entities', entityCount, true)

        if (renderer.rootGroup && entityCount > 0) {
            const sceneTreeBtn = document.createElement('button')
            sceneTreeBtn.className = 'inspector-btn primary'
            sceneTreeBtn.textContent = '🎬 Scene Tree'
            sceneTreeBtn.addEventListener('click', () => this.#openSceneTree())
            this.#actionsEl.appendChild(sceneTreeBtn)
        }
    }


    #addRow (label, value, isAccent = false) {
        const labelEl = document.createElement('div')
        labelEl.className = 'inspector-label'
        labelEl.textContent = label

        const valueEl = document.createElement('div')
        valueEl.className = `inspector-value ${isAccent ? 'accent' : ''}`
        valueEl.textContent = String(value)

        this.#gridEl.appendChild(labelEl)
        this.#gridEl.appendChild(valueEl)
    }


    #openSceneTree () {
        if (!this.#module?.rootGroup) {
            return
        }

        this.dispatchEvent(new CustomEvent('open:scene-tree', {
            bubbles: true,
            composed: true,
            detail: {
                content: this.#module.rootGroup,
                worldRenderer: this.#module
            }
        }))
    }

}


customElements.define('world-renderer-inspector', WorldRendererInspector)
