import BaseEditorComponent from './base_editor_component.js'
import {explorerStyles} from './perky_explorer_styles.js'
import './perky_explorer_node.js'
import './scene_tree_sidebar.js'
import PerkyExplorerDetails from './perky_explorer_details.js'
import GameLoopInspector from './inspectors/game_loop_inspector.js'
import TextureManagerInspector from './inspectors/texture_manager_inspector.js'
import EntityInspector from './inspectors/entity_inspector.js'
import CanvasLayerInspector from './inspectors/canvas_layer_inspector.js'
import WorldViewInspector from './inspectors/world_view_inspector.js'
import WebGLCanvasInspector from './inspectors/webgl_canvas_inspector.js'
import RenderGroupInspector from './inspectors/render_group_inspector.js'
import ManifestInspector from './inspectors/manifest_inspector.js'
import InputBinderInspector from './inspectors/input_binder_inspector.js'


PerkyExplorerDetails.registerInspector(GameLoopInspector)
PerkyExplorerDetails.registerInspector(TextureManagerInspector)
PerkyExplorerDetails.registerInspector(EntityInspector)
PerkyExplorerDetails.registerInspector(CanvasLayerInspector)
PerkyExplorerDetails.registerInspector(WorldViewInspector)
PerkyExplorerDetails.registerInspector(WebGLCanvasInspector)
PerkyExplorerDetails.registerInspector(RenderGroupInspector)
PerkyExplorerDetails.registerInspector(ManifestInspector)
PerkyExplorerDetails.registerInspector(InputBinderInspector)


export default class PerkyExplorer extends BaseEditorComponent {

    static observedAttributes = ['embedded']

    #module = null
    #isMinimized = false
    #isCollapsed = false
    #sceneTreeMode = false
    #sceneTreeSource = null
    #embedded = false

    #containerEl = null
    #sidebarEl = null
    #explorerEl = null
    #minimizedEl = null
    #headerEl = null
    #treeEl = null
    #rootNode = null
    #detailsEl = null
    #collapseBtnEl = null
    #minimizeBtnEl = null

    #selectedModule = null
    #rootModule = null
    #backToRootBtnEl = null
    #backNodeEl = null


    connectedCallback () {
        this.#buildDOM()
    }


    attributeChangedCallback (name, oldValue, newValue) {
        if (oldValue === newValue) {
            return
        }

        if (name === 'embedded') {
            this.#embedded = newValue !== null
            this.#updateEmbeddedMode()
        }
    }


    get embedded () {
        return this.#embedded
    }


    set embedded (value) {
        this.#embedded = value
        if (value) {
            this.setAttribute('embedded', '')
        } else {
            this.removeAttribute('embedded')
        }
        this.#updateEmbeddedMode()
    }


    setModule (module) {
        this.#module = module
        this.#rootModule = module
        this.#selectedModule = null

        if (this.#rootNode) {
            this.#rootNode.setModule(module, 0)
            if (module) {
                this.#rootNode.setExpanded(true)
            }
        }

        this.#updateTreeVisibility()
        this.#updateDetails()
        this.#updateHeaderControls()
        this.#closeSceneTree()
    }


    getModule () {
        return this.#module
    }


    #buildDOM () {
        const style = document.createElement('style')
        style.textContent = explorerStyles + containerStyles
        this.shadowRoot.appendChild(style)

        this.#containerEl = document.createElement('div')
        this.#containerEl.className = 'explorer-container'

        this.#minimizedEl = this.#createMinimizedView()
        this.#explorerEl = this.#createExpandedView()
        this.#sidebarEl = this.#createSceneTreeView()

        this.#containerEl.appendChild(this.#minimizedEl)
        this.#containerEl.appendChild(this.#explorerEl)
        this.#containerEl.appendChild(this.#sidebarEl)

        this.shadowRoot.appendChild(this.#containerEl)

        this.#updateViewState()
        this.#updateTreeVisibility()
    }


    #createMinimizedView () {
        const container = document.createElement('div')
        container.className = 'explorer-minimized'

        const backButton = document.createElement('span')
        backButton.className = 'explorer-back-button'
        backButton.textContent = '←'

        const label = document.createElement('span')
        label.className = 'explorer-minimized-label'

        container.appendChild(backButton)
        container.appendChild(label)

        container.addEventListener('click', () => {
            this.#isMinimized = false
            this.#closeSceneTree()
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

        this.#detailsEl.addEventListener('open:scene-tree', (e) => {
            this.#openSceneTree(e.detail.content, e.detail.worldRenderer)
        })

        this.#detailsEl.addEventListener('focus:module', (e) => {
            this.focusModule(e.detail.module)
        })

        explorer.appendChild(this.#headerEl)
        explorer.appendChild(this.#treeEl)
        explorer.appendChild(this.#detailsEl)

        return explorer
    }


    #createSceneTreeView () {
        const sidebar = document.createElement('scene-tree-sidebar')
        sidebar.classList.add('hidden')
        sidebar.addEventListener('sidebar:close', () => this.#closeSceneTree())
        sidebar.addEventListener('navigate:entity', (e) => {
            this.#navigateToEntity(e.detail.entity)
        })
        return sidebar
    }


    #createHeader () {
        const header = document.createElement('div')
        header.className = 'explorer-header'

        const title = document.createElement('div')
        title.className = 'explorer-title'
        title.innerHTML = '<span class="explorer-title-icon">📦</span> Perky Explorer'

        const buttons = document.createElement('div')
        buttons.className = 'explorer-buttons'

        this.#backToRootBtnEl = document.createElement('button')
        this.#backToRootBtnEl.className = 'explorer-btn'
        this.#backToRootBtnEl.textContent = 'Back'
        this.#backToRootBtnEl.title = 'Go Back'
        this.#backToRootBtnEl.style.display = 'none' // Start hidden
        this.#backToRootBtnEl.addEventListener('click', (e) => {
            e.stopPropagation()
            this.focusModule(this.#module)
        })

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

        this.#minimizeBtnEl = document.createElement('button')
        this.#minimizeBtnEl.className = 'explorer-btn'
        this.#minimizeBtnEl.textContent = '◻'
        this.#minimizeBtnEl.title = 'Minimize'
        this.#minimizeBtnEl.addEventListener('click', (e) => {
            e.stopPropagation()
            this.#isMinimized = true
            this.#updateViewState()
        })

        buttons.appendChild(this.#backToRootBtnEl)
        buttons.appendChild(refreshBtn)
        buttons.appendChild(this.#collapseBtnEl)
        buttons.appendChild(this.#minimizeBtnEl)

        header.appendChild(title)
        header.appendChild(buttons)

        header.addEventListener('click', () => this.#toggleCollapse())

        return header
    }


    #createTree () {
        const tree = document.createElement('div')
        tree.className = 'explorer-tree'

        this.#backNodeEl = this.#createBackNode()
        tree.appendChild(this.#backNodeEl)

        this.#rootNode = document.createElement('perky-explorer-node')
        this.#rootNode.addEventListener('node:select', (e) => {
            this.#handleNodeSelect(e.detail.module)
        })

        tree.appendChild(this.#rootNode)

        return tree
    }


    #handleNodeSelect (module) {
        if (this.#selectedModule) {
            this.#rootNode.deselectAll()
        }

        this.#selectedModule = module

        const selectedNode = this.#rootNode.findNode(n => n.getModule() === module)
        if (selectedNode) {
            selectedNode.setSelected(true)
        }

        this.#closeSceneTree()
        this.#detailsEl.setModule(module)
    }


    #updateViewState () { // eslint-disable-line complexity
        const label = this.#minimizedEl.querySelector('.explorer-minimized-label')

        if (this.#sceneTreeMode) {
            this.#minimizedEl.classList.remove('hidden')
            this.#minimizedEl.classList.add('scene-tree-mode')
            this.#explorerEl.classList.add('hidden')
            this.#sidebarEl.classList.remove('hidden')

            if (label) {
                const source = this.#sceneTreeSource || this.#selectedModule
                label.textContent = source?.name || 'Scene Tree'
            }
        } else if (this.#isMinimized) {
            this.#minimizedEl.classList.remove('hidden')
            this.#minimizedEl.classList.remove('scene-tree-mode')
            this.#explorerEl.classList.add('hidden')
            this.#sidebarEl.classList.add('hidden')

            if (label) {
                label.textContent = 'Explorer'
            }
        } else {
            this.#minimizedEl.classList.add('hidden')
            this.#minimizedEl.classList.remove('scene-tree-mode')
            this.#explorerEl.classList.remove('hidden')
            this.#sidebarEl.classList.add('hidden')
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
        if (this.#rootModule) {
            this.#rootNode.setModule(this.#rootModule, 0)
            this.#rootNode.setExpanded(true)
        }

        if (this.#selectedModule) {
            const node = this.#rootNode.findNode(n => n.getModule() === this.#selectedModule)
            if (node) {
                node.setSelected(true)
            }
            this.#detailsEl.setModule(this.#selectedModule)
        }
    }


    #openSceneTree (content, worldRenderer = null) {
        this.#sceneTreeMode = true
        this.#sceneTreeSource = worldRenderer
        this.#sidebarEl.setContent(content, worldRenderer)
        this.#updateViewState()
    }


    #closeSceneTree () {
        this.#sceneTreeMode = false
        this.#sceneTreeSource = null
        this.#updateViewState()
    }


    #navigateToEntity (entity) {
        this.#closeSceneTree()

        const node = this.#rootNode.findNode(n => n.getModule() === entity)
        if (node) {
            if (this.#selectedModule) {
                this.#rootNode.deselectAll()
            }

            this.#selectedModule = entity
            node.setSelected(true)
            this.#detailsEl.setModule(entity)

            this.#expandParentsToNode(node)
        }
    }


    #expandParentsToNode (targetNode) {
        const expandPath = (node) => {
            const childNodeTag = node.constructor.childNodeTag
            if (!childNodeTag) {
                return false
            }
            const children = node.shadowRoot.querySelectorAll(childNodeTag)
            for (const child of children) {
                if (child === targetNode || child.findNode(n => n === targetNode)) {
                    node.setExpanded(true)
                    expandPath(child)
                    return true
                }
            }
            return false
        }
        expandPath(this.#rootNode)
    }


    #updateEmbeddedMode () {
        if (!this.#minimizedEl || !this.#minimizeBtnEl) {
            return
        }

        if (this.#embedded) {
            this.#minimizedEl.classList.add('hidden')
            this.#minimizeBtnEl.classList.add('hidden')
            this.#isMinimized = false
            this.#updateViewState()
        } else {
            this.#minimizeBtnEl.classList.remove('hidden')
        }
    }


    focusModule (module) {
        if (!module) {
            return
        }

        this.#rootModule = module
        this.#rootNode.setModule(module, 0)
        this.#rootNode.setExpanded(true)
        this.#updateHeaderControls()

        // If the selected module is not within the new focus hierarchy, clear selection
        // Actually, let's keep it simply: if we focus, we probably want to see that node expanded
        // But if the selected node was deep down, it might still be visible.
        // For now, let's just re-select if visible, or clear if not.

        if (this.#selectedModule) {
            const node = this.#rootNode.findNode(n => n.getModule() === this.#selectedModule)
            if (node) {
                node.setSelected(true)
            } else {
                // Selected module is outside of focus scope, maybe we should select the focused root?
                // Or just keep the details showing the old one?
                // Let's select the root module
                this.#handleNodeSelect(module)
            }
        }
    }


    #updateHeaderControls () { // eslint-disable-line complexity
        this.#updateTreeNavigation()

        if (!this.#backToRootBtnEl) {
            return
        }

        // Ensure button is in the DOM (fail-safe)
        if (!this.#backToRootBtnEl.isConnected && this.#headerEl) {
            const buttons = this.#headerEl.querySelector('.explorer-buttons')
            if (buttons) {
                buttons.insertBefore(this.#backToRootBtnEl, buttons.firstChild)
            }
        }

        const isRoot = this.#rootModule && this.#module && this.#rootModule.$id === this.#module.$id

        if (this.#rootModule && !isRoot) {
            this.#backToRootBtnEl.style.display = 'inline-block'
            this.#backToRootBtnEl.classList.remove('hidden')
            this.#headerEl.querySelector('.explorer-title').textContent = this.#rootModule.$id
        } else {
            this.#backToRootBtnEl.style.display = 'none'
            this.#headerEl.querySelector('.explorer-title').innerHTML = '<span class="explorer-title-icon">📦</span> Perky Explorer'
        }
    }


    #createBackNode () {
        const node = document.createElement('div')
        node.className = 'explorer-back-node hidden'
        node.innerHTML = `
            <span class="explorer-back-icon">↩</span>
            <span class="explorer-back-label">Back</span>
        `
        node.addEventListener('click', (e) => {
            e.stopPropagation()
            this.focusModule(this.#module)
        })
        return node
    }


    #updateTreeNavigation () {
        if (!this.#backNodeEl) {
            return
        }

        const isRoot = this.#rootModule && this.#module && this.#rootModule.$id === this.#module.$id

        if (this.#rootModule && !isRoot) {
            this.#backNodeEl.classList.remove('hidden')

            // Update label to show where we are going back to? 
            // "Back to Root" is generic and fine.
        } else {
            this.#backNodeEl.classList.add('hidden')
        }
    }

}


const containerStyles = `
    .explorer-container {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 10px;
    }

    :host([embedded]) {
        position: static;
        width: 100%;
        max-height: none;
        right: auto;
        top: auto;
    }

    :host([embedded]) .explorer-container {
        align-items: stretch;
    }

    :host([embedded]) .explorer {
        max-height: none;
        border: none;
        border-radius: 0;
        box-shadow: none;
        width: 100%;
    }

    :host([embedded]) .explorer-header {
        display: none;
    }

    :host([embedded]) .explorer-tree {
        max-height: none;
    }
`


customElements.define('perky-explorer', PerkyExplorer)
