import EditorComponent from './editor_component.js'
import {cssVariables, panelStyles} from './perky_explorer.styles.js'
import './scene_tree_node.js'
import Object2DInspector from './inspectors/object_2d_inspector.js'


const DEBOUNCE_MS = 100


export default class SceneTreeSidebar extends EditorComponent {

    static styles = `
    :host { ${cssVariables} }

    ${panelStyles}

    :host {
        display: block;
        width: 320px;
        background: var(--bg-primary);
        overflow: hidden;
        font-family: var(--font-mono);
        font-size: 12px;
        max-height: calc(100vh - 20px);
        display: flex;
        flex-direction: column;
    }

    .panel-tree {
        max-height: 300px;
    }

    .panel-details {
        border-top: 1px solid var(--border);
        background: var(--bg-secondary);
        padding: 10px 12px;
    }

    .panel-empty {
        color: var(--fg-muted);
        font-style: italic;
    }
    `

    #content = null
    #worldRenderer = null
    #headerEl = null
    #treeEl = null
    #rootNode = null
    #detailsEl = null
    #selectedObject = null
    #refreshTimeout = null

    onConnected () {
        this.#buildDOM()
    }


    onDisconnected () {
        this.#clearRefreshTimeout()
    }


    setContent (content, worldRenderer = null) {
        this.cleanListeners()
        this.#content = content
        this.#worldRenderer = worldRenderer
        this.#selectedObject = null

        if (this.#rootNode) {
            if (content) {
                this.#rootNode.setObject(content, 0)
                this.#rootNode.setExpanded(true)
                this.#rootNode.style.display = ''
            } else {
                this.#rootNode.style.display = 'none'
            }
        }

        if (worldRenderer) {
            this.#bindEvents()
        }

        this.#updateDetails()
    }


    getContent () {
        return this.#content
    }


    close () {
        this.cleanListeners()
        this.dispatchEvent(new CustomEvent('sidebar:close', {
            bubbles: true,
            composed: true
        }))
    }


    refresh () {
        if (this.#content && this.#rootNode) {
            this.#rootNode.setObject(this.#content, 0)
            this.#rootNode.setExpanded(true)
        }

        if (this.#selectedObject) {
            const node = this.#rootNode.findNode(n => n.getObject() === this.#selectedObject)
            if (node) {
                node.setSelected(true)
            }
            this.#updateInspector()
        }
    }


    #bindEvents () {
        if (!this.#worldRenderer) {
            return
        }

        this.listenTo(this.#worldRenderer, 'view:added', () => this.#scheduleRefresh())
        this.listenTo(this.#worldRenderer, 'view:removed', () => this.#scheduleRefresh())
        this.listenTo(this.#worldRenderer, 'dispose', () => this.close())
    }


    #scheduleRefresh () {
        if (this.#refreshTimeout) {
            return
        }

        this.#refreshTimeout = setTimeout(() => {
            this.#refreshTimeout = null
            this.refresh()
        }, DEBOUNCE_MS)
    }


    #clearRefreshTimeout () {
        if (this.#refreshTimeout) {
            clearTimeout(this.#refreshTimeout)
            this.#refreshTimeout = null
        }
    }


    #buildDOM () {
        this.#headerEl = this.#createHeader()
        this.#treeEl = this.#createTree()
        this.#detailsEl = document.createElement('div')
        this.#detailsEl.className = 'panel-details'

        this.shadowRoot.appendChild(this.#headerEl)
        this.shadowRoot.appendChild(this.#treeEl)
        this.shadowRoot.appendChild(this.#detailsEl)
    }


    #createHeader () {
        const header = document.createElement('div')
        header.className = 'panel-header'

        const title = document.createElement('div')
        title.className = 'panel-title'
        title.innerHTML = '<span class="panel-title-icon">🎬</span> Scene Tree'

        const buttons = document.createElement('div')
        buttons.className = 'panel-buttons'

        const refreshBtn = document.createElement('button')
        refreshBtn.className = 'panel-btn'
        refreshBtn.textContent = '↻'
        refreshBtn.title = 'Refresh'
        refreshBtn.addEventListener('click', () => this.refresh())

        const closeBtn = document.createElement('button')
        closeBtn.className = 'panel-btn'
        closeBtn.textContent = '✕'
        closeBtn.title = 'Close'
        closeBtn.addEventListener('click', () => this.close())

        buttons.appendChild(refreshBtn)
        buttons.appendChild(closeBtn)

        header.appendChild(title)
        header.appendChild(buttons)

        return header
    }


    #createTree () {
        const tree = document.createElement('div')
        tree.className = 'panel-tree'

        this.#rootNode = document.createElement('scene-tree-node')
        this.#rootNode.style.display = 'none'
        this.#rootNode.addEventListener('node:select', (e) => {
            this.#handleNodeSelect(e.detail.object)
        })
        this.#rootNode.addEventListener('navigate:entity', (e) => {
            this.dispatchEvent(new CustomEvent('navigate:entity', {
                bubbles: true,
                composed: true,
                detail: e.detail
            }))
        })

        tree.appendChild(this.#rootNode)

        return tree
    }


    #handleNodeSelect (object) {
        if (this.#selectedObject) {
            this.#rootNode.deselectAll()
        }

        this.#selectedObject = object

        const selectedNode = this.#rootNode.findNode(n => n.getObject() === object)
        if (selectedNode) {
            selectedNode.setSelected(true)
        }

        this.#updateInspector()
    }


    #updateDetails () {
        if (this.#selectedObject) {
            this.#updateInspector()
        } else {
            this.#detailsEl.innerHTML = ''
            const empty = document.createElement('div')
            empty.className = 'panel-empty'
            empty.textContent = 'Select an object to inspect'
            this.#detailsEl.appendChild(empty)
        }
    }


    #updateInspector () {
        this.#detailsEl.innerHTML = ''

        if (this.#selectedObject) {
            const inspector = new Object2DInspector()
            inspector.setModule(this.#selectedObject)
            this.#detailsEl.appendChild(inspector)
        }
    }

}


customElements.define('scene-tree-sidebar', SceneTreeSidebar)
