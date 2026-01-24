import EditorComponent from './editor_component.js'
import {explorerStyles} from './perky_explorer.styles.js'
import './perky_explorer_node.js'
import './scene_tree_sidebar.js'
import './inspectors/index.js'
import ExplorerContextMenu from './explorer_context_menu.js'
import {getActionsForModule, registerActionProvider} from './context_menu_actions.js'
import {ICONS} from './devtools/devtools_icons.js'
import {createElement} from '../application/dom_utils.js'


const DEFAULT_SYSTEM_CATEGORIES = [
    'actionDispatcher',
    'inputSystem',
    'renderSystem',
    'sourceManager',
    'perkyView',
    'gameLoop',
    'textureSystem',
    'audioSystem',
    'manifest'
]


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


export default class PerkyExplorer extends EditorComponent {

    static observedAttributes = ['embedded']

    static styles = `${explorerStyles} ${containerStyles}`

    #module = null
    #isMinimized = false
    #isCollapsed = false
    #sceneTreeMode = false
    #focusMode = false
    #embedded = false
    #showSystemModules = false
    #systemCategories = [...DEFAULT_SYSTEM_CATEGORIES]

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
    #layersBtnEl = null

    #selectedModule = null
    #rootModule = null
    #contextMenuEl = null

    onConnected () {
        this.#buildDOM()
    }


    onDisconnected () {
        if (this.#contextMenuEl && this.#contextMenuEl.parentNode) {
            this.#contextMenuEl.parentNode.removeChild(this.#contextMenuEl)
        }
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


    get systemCategories () {
        return this.#systemCategories
    }


    set systemCategories (value) {
        this.#systemCategories = value
        this.#refresh()
    }


    get showSystemModules () {
        return this.#showSystemModules
    }


    set showSystemModules (value) {
        this.#showSystemModules = value
        this.#updateLayersButton()
        this.#refresh()
        this.dispatchEvent(new CustomEvent('showSystemModules:change', {
            detail: {showSystemModules: value}
        }))
    }


    isSystemModule (module) {
        return module && this.#systemCategories.includes(module.$category)
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
        this.#containerEl = createElement('div', {class: 'explorer-container'})

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
        const container = createElement('div', {class: 'explorer-minimized'})

        const backButton = createElement('span', {
            class: 'explorer-back-button',
            text: '←'
        })

        container.appendChild(backButton)

        container.addEventListener('click', () => {
            if (this.#sceneTreeMode) {
                this.#closeSceneTree()
            } else if (this.#focusMode) {
                this.focusModule(this.#module)
            } else {
                this.#isMinimized = false
                this.#updateViewState()
            }
        })
        return container
    }


    #createExpandedView () {
        const explorer = createElement('div', {class: 'explorer'})

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
        const header = createElement('div', {class: 'explorer-header'})

        const title = createElement('div', {
            class: 'explorer-title',
            html: '<span class="explorer-title-icon">📦</span> Perky Explorer'
        })

        const buttons = createElement('div', {class: 'explorer-buttons'})

        const refreshBtn = createElement('button', {
            class: 'explorer-btn',
            text: '↻',
            title: 'Refresh'
        })
        refreshBtn.addEventListener('click', (e) => {
            e.stopPropagation()
            this.#refresh()
        })

        this.#collapseBtnEl = createElement('button', {
            class: 'explorer-btn',
            text: '−',
            title: 'Collapse'
        })
        this.#collapseBtnEl.addEventListener('click', (e) => {
            e.stopPropagation()
            this.#toggleCollapse()
        })

        this.#minimizeBtnEl = createElement('button', {
            class: 'explorer-btn',
            text: '◻',
            title: 'Minimize'
        })
        this.#minimizeBtnEl.addEventListener('click', (e) => {
            e.stopPropagation()
            this.#isMinimized = true
            this.#updateViewState()
        })

        this.#layersBtnEl = createElement('button', {
            class: 'explorer-btn explorer-btn-icon',
            html: ICONS.layers,
            title: 'Show system modules'
        })
        this.#layersBtnEl.addEventListener('click', (e) => {
            e.stopPropagation()
            this.showSystemModules = !this.#showSystemModules
        })

        buttons.appendChild(refreshBtn)
        buttons.appendChild(this.#layersBtnEl)
        buttons.appendChild(this.#collapseBtnEl)
        buttons.appendChild(this.#minimizeBtnEl)

        header.appendChild(title)
        header.appendChild(buttons)

        header.addEventListener('click', () => this.#toggleCollapse())

        return header
    }


    #createTree () {
        const tree = createElement('div', {class: 'explorer-tree'})

        this.#rootNode = document.createElement('perky-explorer-node')
        this.#rootNode.addEventListener('node:select', (e) => {
            this.#handleNodeSelect(e.detail.module)
        })
        this.#rootNode.addEventListener('node:contextmenu', (e) => {
            this.#handleNodeContextMenu(e.detail)
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


    #handleNodeContextMenu (detail) {
        const {module, x, y} = detail

        if (!module) {
            return
        }

        this.#ensureContextMenu()

        const actions = getActionsForModule(module, {
            onFocus: (m) => this.focusModule(m),
            onInspect: () => this.dispatchEvent(new CustomEvent('inspect'))
        })

        if (module === this.#rootModule) {
            actions.push({separator: true})
            actions.push({
                iconSvg: ICONS.layers,
                label: this.#showSystemModules ? 'Hide system modules' : 'Show system modules',
                action: () => {
                    this.showSystemModules = !this.#showSystemModules
                }
            })
        }

        this.#contextMenuEl.show(actions, module, {x, y})
    }


    #ensureContextMenu () {
        if (!this.#contextMenuEl) {
            this.#contextMenuEl = new ExplorerContextMenu()
            document.body.appendChild(this.#contextMenuEl)
        }
    }


    #updateViewState () {
        if (this.#sceneTreeMode) {
            this.#minimizedEl.classList.remove('hidden')
            this.#minimizedEl.classList.add('back-mode')
            this.#explorerEl.classList.add('hidden')
            this.#sidebarEl.classList.remove('hidden')
        } else if (this.#focusMode) {
            this.#minimizedEl.classList.remove('hidden')
            this.#minimizedEl.classList.add('back-mode')
            this.#explorerEl.classList.remove('hidden')
            this.#sidebarEl.classList.add('hidden')
        } else if (this.#isMinimized) {
            this.#minimizedEl.classList.remove('hidden')
            this.#minimizedEl.classList.remove('back-mode')
            this.#explorerEl.classList.add('hidden')
            this.#sidebarEl.classList.add('hidden')
        } else {
            this.#minimizedEl.classList.add('hidden')
            this.#minimizedEl.classList.remove('back-mode')
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


    #updateLayersButton () {
        if (!this.#layersBtnEl) {
            return
        }

        if (this.#showSystemModules) {
            this.#layersBtnEl.classList.add('active')
            this.#layersBtnEl.title = 'Hide system modules'
        } else {
            this.#layersBtnEl.classList.remove('active')
            this.#layersBtnEl.title = 'Show system modules'
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

        const empty = createElement('div', {
            class: 'explorer-empty',
            text: 'No module attached. Use setModule() to explore.'
        })
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
        this.#sidebarEl.setContent(content, worldRenderer)
        this.#updateViewState()
    }


    #closeSceneTree () {
        this.#sceneTreeMode = false
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


        if (this.#selectedModule) {
            const node = this.#rootNode.findNode(n => n.getModule() === this.#selectedModule)
            if (node) {
                node.setSelected(true)
            } else {


                this.#handleNodeSelect(module)
            }
        }
    }


    #updateHeaderControls () {
        const isRoot = this.#rootModule && this.#module && this.#rootModule.$id === this.#module.$id
        this.#focusMode = this.#rootModule && !isRoot

        this.#updateViewState()

        if (this.#focusMode) {
            this.#headerEl.querySelector('.explorer-title').textContent = this.#rootModule.$id
        } else {
            this.#headerEl.querySelector('.explorer-title').innerHTML = '<span class="explorer-title-icon">📦</span> Perky Explorer'
        }
    }

}


PerkyExplorer.registerActionProvider = registerActionProvider


customElements.define('perky-explorer', PerkyExplorer)
