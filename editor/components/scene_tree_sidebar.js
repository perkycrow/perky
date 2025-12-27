import BaseEditorComponent from './base_editor_component.js'
import {cssVariables} from './perky_explorer_styles.js'
import './scene_tree_node.js'
import Object2DInspector from '../inspectors/object_2d_inspector.js'


const DEBOUNCE_MS = 100


const sidebarStyles = `
    :host {
        display: block;
        width: 320px;
        background: var(--bg-primary);
        border: 1px solid var(--border);
        border-radius: 6px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
        overflow: hidden;
        font-family: var(--font-mono);
        font-size: 12px;
        max-height: calc(100vh - 20px);
        display: flex;
        flex-direction: column;
    }

    .sidebar-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 10px 12px;
        background: var(--bg-secondary);
        border-bottom: 1px solid var(--border);
    }

    .sidebar-title {
        display: flex;
        align-items: center;
        gap: 8px;
        color: var(--fg-primary);
        font-weight: 500;
    }

    .sidebar-icon {
        font-size: 14px;
    }

    .sidebar-buttons {
        display: flex;
        gap: 4px;
    }

    .sidebar-btn {
        background: var(--bg-hover);
        border: none;
        border-radius: 4px;
        color: var(--fg-secondary);
        padding: 4px 8px;
        cursor: pointer;
        font-family: inherit;
        font-size: 11px;
        transition: background 0.15s, color 0.15s;
    }

    .sidebar-btn:hover {
        background: var(--bg-selected);
        color: var(--fg-primary);
    }

    .sidebar-tree {
        flex: 1;
        overflow-y: auto;
        padding: 8px 0;
        min-height: 100px;
        max-height: 300px;
    }

    .sidebar-tree::-webkit-scrollbar {
        width: 6px;
    }

    .sidebar-tree::-webkit-scrollbar-track {
        background: var(--bg-primary);
    }

    .sidebar-tree::-webkit-scrollbar-thumb {
        background: var(--border);
        border-radius: 3px;
    }

    .sidebar-details {
        border-top: 1px solid var(--border);
        background: var(--bg-secondary);
        padding: 10px 12px;
    }

    .sidebar-empty {
        color: var(--fg-muted);
        font-style: italic;
    }
`


export default class SceneTreeSidebar extends BaseEditorComponent {

    #content = null
    #worldRenderer = null
    #headerEl = null
    #treeEl = null
    #rootNode = null
    #detailsEl = null
    #selectedObject = null
    #refreshTimeout = null


    constructor () {
        super()
        this.#buildDOM()
    }


    disconnectedCallback () {
        this.#clearRefreshTimeout()
        super.disconnectedCallback()
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
            const node = this.#findNodeByObject(this.#rootNode, this.#selectedObject)
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

        this.listenTo(this.#worldRenderer, 'renderer:added', () => this.#scheduleRefresh())
        this.listenTo(this.#worldRenderer, 'renderer:removed', () => this.#scheduleRefresh())
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
        const style = document.createElement('style')
        style.textContent = `:host { ${cssVariables} } ${sidebarStyles}`
        this.shadowRoot.appendChild(style)

        this.#headerEl = this.#createHeader()
        this.#treeEl = this.#createTree()
        this.#detailsEl = document.createElement('div')
        this.#detailsEl.className = 'sidebar-details'

        this.shadowRoot.appendChild(this.#headerEl)
        this.shadowRoot.appendChild(this.#treeEl)
        this.shadowRoot.appendChild(this.#detailsEl)
    }


    #createHeader () {
        const header = document.createElement('div')
        header.className = 'sidebar-header'

        const title = document.createElement('div')
        title.className = 'sidebar-title'
        title.innerHTML = '<span class="sidebar-icon">🎬</span> Scene Tree'

        const buttons = document.createElement('div')
        buttons.className = 'sidebar-buttons'

        const refreshBtn = document.createElement('button')
        refreshBtn.className = 'sidebar-btn'
        refreshBtn.textContent = '↻'
        refreshBtn.title = 'Refresh'
        refreshBtn.addEventListener('click', () => this.refresh())

        const closeBtn = document.createElement('button')
        closeBtn.className = 'sidebar-btn'
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
        tree.className = 'sidebar-tree'

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
            this.#deselectAll(this.#rootNode)
        }

        this.#selectedObject = object

        const selectedNode = this.#findNodeByObject(this.#rootNode, object)
        if (selectedNode) {
            selectedNode.setSelected(true)
        }

        this.#updateInspector()
    }


    #deselectAll (node) {
        node.setSelected(false)

        const children = node.shadowRoot.querySelectorAll('scene-tree-node')
        for (const child of children) {
            this.#deselectAll(child)
        }
    }


    #findNodeByObject (node, object) {
        if (node.getObject() === object) {
            return node
        }

        const children = node.shadowRoot.querySelectorAll('scene-tree-node')
        for (const child of children) {
            const found = this.#findNodeByObject(child, object)
            if (found) {
                return found
            }
        }

        return null
    }


    #updateDetails () {
        if (this.#selectedObject) {
            this.#updateInspector()
        } else {
            this.#detailsEl.innerHTML = ''
            const empty = document.createElement('div')
            empty.className = 'sidebar-empty'
            empty.textContent = 'Select an object to inspect'
            this.#detailsEl.appendChild(empty)
        }
    }


    #updateInspector () {
        this.#detailsEl.innerHTML = ''

        if (this.#selectedObject) {
            const inspector = new Object2DInspector()
            inspector.setObject(this.#selectedObject)
            this.#detailsEl.appendChild(inspector)
        }
    }

}


customElements.define('scene-tree-sidebar', SceneTreeSidebar)
