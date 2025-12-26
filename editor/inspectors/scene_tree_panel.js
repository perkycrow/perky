import {cssVariables} from '../components/perky_explorer_styles.js'
import '../components/scene_tree_node.js'
import Object2DInspector from './object_2d_inspector.js'


export default class SceneTreePanel extends HTMLElement {

    #content = null
    #treeEl = null
    #rootNode = null
    #detailsEl = null
    #selectedObject = null


    constructor () {
        super()
        this.attachShadow({mode: 'open'})
        this.#buildDOM()
    }


    setContent (content) {
        this.#content = content
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

        this.#updateDetails()
    }


    getContent () {
        return this.#content
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


    #buildDOM () {
        const style = document.createElement('style')
        style.textContent = `:host { ${cssVariables} } ${sceneTreePanelStyles}`
        this.shadowRoot.appendChild(style)

        const header = this.#createHeader()
        this.#treeEl = this.#createTree()
        this.#detailsEl = document.createElement('div')
        this.#detailsEl.className = 'scene-tree-details'

        this.shadowRoot.appendChild(header)
        this.shadowRoot.appendChild(this.#treeEl)
        this.shadowRoot.appendChild(this.#detailsEl)
    }


    #createHeader () {
        const header = document.createElement('div')
        header.className = 'scene-tree-header'

        const title = document.createElement('span')
        title.className = 'scene-tree-title'
        title.innerHTML = '<span class="scene-tree-icon">🎬</span> Scene Tree'

        const refreshBtn = document.createElement('button')
        refreshBtn.className = 'scene-tree-btn'
        refreshBtn.textContent = '↻'
        refreshBtn.title = 'Refresh'
        refreshBtn.addEventListener('click', () => this.refresh())

        header.appendChild(title)
        header.appendChild(refreshBtn)

        return header
    }


    #createTree () {
        const tree = document.createElement('div')
        tree.className = 'scene-tree-content'

        this.#rootNode = document.createElement('scene-tree-node')
        this.#rootNode.style.display = 'none'
        this.#rootNode.addEventListener('node:select', (e) => {
            this.#handleNodeSelect(e.detail.object)
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
            empty.className = 'scene-tree-empty'
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


const sceneTreePanelStyles = `
    :host {
        display: block;
        font-family: var(--font-mono);
        font-size: 12px;
    }

    .scene-tree-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 8px 0;
        border-bottom: 1px solid var(--border);
        margin-bottom: 8px;
    }

    .scene-tree-title {
        display: flex;
        align-items: center;
        gap: 6px;
        color: var(--fg-primary);
        font-weight: 500;
    }

    .scene-tree-icon {
        font-size: 14px;
    }

    .scene-tree-btn {
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

    .scene-tree-btn:hover {
        background: var(--bg-selected);
        color: var(--fg-primary);
    }

    .scene-tree-content {
        max-height: 200px;
        overflow-y: auto;
        padding: 4px 0;
    }

    .scene-tree-content::-webkit-scrollbar {
        width: 6px;
    }

    .scene-tree-content::-webkit-scrollbar-track {
        background: transparent;
    }

    .scene-tree-content::-webkit-scrollbar-thumb {
        background: var(--border);
        border-radius: 3px;
    }

    .scene-tree-details {
        padding-top: 8px;
        border-top: 1px solid var(--border);
        margin-top: 8px;
    }

    .scene-tree-empty {
        color: var(--fg-muted);
        font-style: italic;
        padding: 8px 0;
    }
`


customElements.define('scene-tree-panel', SceneTreePanel)
