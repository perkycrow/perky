import {explorerStyles} from './perky_explorer_styles.js'
import './perky_explorer_node.js'
import PerkyExplorerDetails from './perky_explorer_details.js'
import GameLoopInspector from '../inspectors/game_loop_inspector.js'


PerkyExplorerDetails.registerInspector('gameLoop', GameLoopInspector)


export default class PerkyExplorer extends HTMLElement {

    #module = null
    #isMinimized = false
    #isCollapsed = false

    #explorerEl = null
    #minimizedEl = null
    #headerEl = null
    #treeEl = null
    #rootNode = null
    #detailsEl = null
    #collapseBtnEl = null

    #selectedModule = null


    constructor () {
        super()
        this.attachShadow({mode: 'open'})
    }


    connectedCallback () {
        this.#buildDOM()
    }


    setModule (module) {
        this.#module = module
        this.#selectedModule = null

        if (this.#rootNode) {
            this.#rootNode.setModule(module, 0)
            if (module) {
                this.#rootNode.setExpanded(true)
            }
        }

        this.#updateTreeVisibility()
        this.#updateDetails()
    }


    getModule () {
        return this.#module
    }


    #buildDOM () {
        const style = document.createElement('style')
        style.textContent = explorerStyles
        this.shadowRoot.appendChild(style)

        this.#minimizedEl = this.#createMinimizedView()
        this.#explorerEl = this.#createExpandedView()

        this.shadowRoot.appendChild(this.#minimizedEl)
        this.shadowRoot.appendChild(this.#explorerEl)

        this.#updateViewState()
        this.#updateTreeVisibility()
    }


    #createMinimizedView () {
        const container = document.createElement('div')
        container.className = 'explorer-minimized'
        container.textContent = '📦'
        container.addEventListener('click', () => {
            this.#isMinimized = false
            this.#updateViewState()
        })
        return container
    }


    #createExpandedView () {
        const explorer = document.createElement('div')
        explorer.className = 'explorer'

        this.#headerEl = this.#createHeader()
        this.#treeEl = this.#createTree()
        this.#detailsEl = document.createElement('perky-explorer-details')

        explorer.appendChild(this.#headerEl)
        explorer.appendChild(this.#treeEl)
        explorer.appendChild(this.#detailsEl)

        return explorer
    }


    #createHeader () {
        const header = document.createElement('div')
        header.className = 'explorer-header'

        const title = document.createElement('div')
        title.className = 'explorer-title'
        title.innerHTML = '<span class="explorer-title-icon">📦</span> Perky Explorer'

        const buttons = document.createElement('div')
        buttons.className = 'explorer-buttons'

        const refreshBtn = document.createElement('button')
        refreshBtn.className = 'explorer-btn'
        refreshBtn.textContent = '↻'
        refreshBtn.title = 'Refresh'
        refreshBtn.addEventListener('click', (e) => {
            e.stopPropagation()
            this.#refresh()
        })

        this.#collapseBtnEl = document.createElement('button')
        this.#collapseBtnEl.className = 'explorer-btn'
        this.#collapseBtnEl.textContent = '−'
        this.#collapseBtnEl.title = 'Collapse'
        this.#collapseBtnEl.addEventListener('click', (e) => {
            e.stopPropagation()
            this.#toggleCollapse()
        })

        const minimizeBtn = document.createElement('button')
        minimizeBtn.className = 'explorer-btn'
        minimizeBtn.textContent = '◻'
        minimizeBtn.title = 'Minimize'
        minimizeBtn.addEventListener('click', (e) => {
            e.stopPropagation()
            this.#isMinimized = true
            this.#updateViewState()
        })

        buttons.appendChild(refreshBtn)
        buttons.appendChild(this.#collapseBtnEl)
        buttons.appendChild(minimizeBtn)

        header.appendChild(title)
        header.appendChild(buttons)

        header.addEventListener('click', () => this.#toggleCollapse())

        return header
    }


    #createTree () {
        const tree = document.createElement('div')
        tree.className = 'explorer-tree'

        this.#rootNode = document.createElement('perky-explorer-node')
        this.#rootNode.addEventListener('node:select', (e) => {
            this.#handleNodeSelect(e.detail.module)
        })

        tree.appendChild(this.#rootNode)

        return tree
    }


    #handleNodeSelect (module) {
        if (this.#selectedModule) {
            this.#deselectAll(this.#rootNode)
        }

        this.#selectedModule = module

        const selectedNode = this.#findNodeByModule(this.#rootNode, module)
        if (selectedNode) {
            selectedNode.setSelected(true)
        }

        this.#detailsEl.setModule(module)
    }


    #deselectAll (node) {
        node.setSelected(false)

        const children = node.shadowRoot.querySelectorAll('perky-explorer-node')
        for (const child of children) {
            this.#deselectAll(child)
        }
    }


    #findNodeByModule (node, module) {
        if (node.getModule() === module) {
            return node
        }

        const children = node.shadowRoot.querySelectorAll('perky-explorer-node')
        for (const child of children) {
            const found = this.#findNodeByModule(child, module)
            if (found) {
                return found
            }
        }

        return null
    }


    #updateViewState () {
        if (this.#isMinimized) {
            this.#minimizedEl.classList.remove('hidden')
            this.#explorerEl.classList.add('hidden')
        } else {
            this.#minimizedEl.classList.add('hidden')
            this.#explorerEl.classList.remove('hidden')
        }
    }


    #toggleCollapse () {
        this.#isCollapsed = !this.#isCollapsed
        this.#updateCollapseState()
    }


    #updateCollapseState () {
        if (this.#isCollapsed) {
            this.#treeEl.classList.add('hidden')
            this.#detailsEl.classList.add('hidden')
            this.#collapseBtnEl.textContent = '+'
            this.#collapseBtnEl.title = 'Expand'
        } else {
            this.#treeEl.classList.remove('hidden')
            this.#detailsEl.classList.remove('hidden')
            this.#collapseBtnEl.textContent = '−'
            this.#collapseBtnEl.title = 'Collapse'
        }
    }


    #updateTreeVisibility () {
        if (this.#module) {
            this.#hideEmptyState()
        } else {
            this.#showEmptyState()
        }
    }


    #showEmptyState () {
        const existing = this.#treeEl.querySelector('.explorer-empty')
        if (existing) {
            return
        }

        const empty = document.createElement('div')
        empty.className = 'explorer-empty'
        empty.textContent = 'No module attached. Use setModule() to explore.'
        this.#treeEl.appendChild(empty)

        this.#rootNode.style.display = 'none'
    }


    #hideEmptyState () {
        const existing = this.#treeEl.querySelector('.explorer-empty')
        if (existing) {
            existing.remove()
        }
        this.#rootNode.style.display = ''
    }


    #updateDetails () {
        if (this.#selectedModule) {
            this.#detailsEl.setModule(this.#selectedModule)
        } else {
            this.#detailsEl.clear()
        }
    }


    #refresh () {
        if (this.#module) {
            this.#rootNode.setModule(this.#module, 0)
            this.#rootNode.setExpanded(true)
        }

        if (this.#selectedModule) {
            const node = this.#findNodeByModule(this.#rootNode, this.#selectedModule)
            if (node) {
                node.setSelected(true)
            }
            this.#detailsEl.setModule(this.#selectedModule)
        }
    }

}


customElements.define('perky-explorer', PerkyExplorer)
