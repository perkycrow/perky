/* eslint-disable complexity */
/**
 * PerkyExplorer - A tree view component to explore PerkyModule hierarchies
 * 
 * Usage:
 *   const explorer = document.createElement('perky-explorer')
 *   explorer.setModule(myApplication)
 *   document.body.appendChild(explorer)
 */


const styles = `
    :host {
        --bg-primary: #1a1a1e;
        --bg-secondary: #24242a;
        --bg-hover: #2e2e36;
        --bg-selected: #3a3a44;
        --fg-primary: #e4e4e8;
        --fg-secondary: #9898a0;
        --fg-muted: #6a6a72;
        --accent: #6b9fff;
        --status-started: #4ade80;
        --status-stopped: #f87171;
        --status-disposed: #6b7280;
        --border: #38383e;
        --font-mono: "Source Code Pro", "SF Mono", "Monaco", monospace;
        
        display: block;
        font-family: var(--font-mono);
        font-size: 12px;
        position: fixed;
        right: 10px;
        top: 10px;
        width: 320px;
        max-height: calc(100vh - 20px);
        z-index: 9999;
    }

    .explorer {
        background: var(--bg-primary);
        border: 1px solid var(--border);
        border-radius: 6px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
        overflow: hidden;
        display: flex;
        flex-direction: column;
        max-height: calc(100vh - 20px);
    }

    .explorer-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 10px 12px;
        background: var(--bg-secondary);
        border-bottom: 1px solid var(--border);
        cursor: pointer;
        user-select: none;
    }

    .explorer-title {
        display: flex;
        align-items: center;
        gap: 8px;
        color: var(--fg-primary);
        font-weight: 500;
    }

    .explorer-title-icon {
        font-size: 14px;
    }

    .explorer-buttons {
        display: flex;
        gap: 4px;
    }

    .explorer-btn {
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

    .explorer-btn:hover {
        background: var(--bg-selected);
        color: var(--fg-primary);
    }

    .explorer-tree {
        flex: 1;
        overflow-y: auto;
        padding: 8px 0;
        min-height: 100px;
        max-height: 400px;
    }

    .explorer-tree::-webkit-scrollbar {
        width: 6px;
    }

    .explorer-tree::-webkit-scrollbar-track {
        background: var(--bg-primary);
    }

    .explorer-tree::-webkit-scrollbar-thumb {
        background: var(--border);
        border-radius: 3px;
    }

    .tree-node {
        cursor: pointer;
    }

    .tree-node-content {
        display: flex;
        align-items: center;
        padding: 4px 12px;
        padding-left: calc(12px + var(--depth, 0) * 16px);
        gap: 6px;
        transition: background 0.1s;
    }

    .tree-node-content:hover {
        background: var(--bg-hover);
    }

    .tree-node-content.selected {
        background: var(--bg-selected);
    }

    .tree-toggle {
        width: 16px;
        height: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--fg-muted);
        font-size: 10px;
        flex-shrink: 0;
    }

    .tree-toggle.has-children {
        cursor: pointer;
    }

    .tree-toggle.has-children:hover {
        color: var(--fg-primary);
    }

    .tree-status {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        flex-shrink: 0;
    }

    .tree-status.started {
        background: var(--status-started);
        box-shadow: 0 0 4px var(--status-started);
    }

    .tree-status.stopped {
        background: var(--status-stopped);
    }

    .tree-status.disposed {
        background: var(--status-disposed);
    }

    .tree-status.static {
        background: var(--fg-muted);
        opacity: 0.5;
    }

    .tree-id {
        color: var(--fg-primary);
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .tree-category {
        color: var(--fg-muted);
        font-size: 10px;
        flex-shrink: 0;
    }

    .tree-children {
        display: none;
    }

    .tree-children.expanded {
        display: block;
    }

    .explorer-details {
        border-top: 1px solid var(--border);
        background: var(--bg-secondary);
        padding: 10px 12px;
    }

    .details-title {
        color: var(--fg-primary);
        font-weight: 500;
        margin-bottom: 8px;
        display: flex;
        align-items: center;
        gap: 6px;
    }

    .details-grid {
        display: grid;
        grid-template-columns: auto 1fr;
        gap: 4px 12px;
        font-size: 11px;
    }

    .details-label {
        color: var(--fg-muted);
    }

    .details-value {
        color: var(--fg-secondary);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .details-value.accent {
        color: var(--accent);
    }

    .details-tags {
        display: flex;
        gap: 4px;
        flex-wrap: wrap;
    }

    .details-tag {
        background: var(--bg-hover);
        padding: 2px 6px;
        border-radius: 3px;
        font-size: 10px;
    }

    .explorer-minimized {
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--bg-primary);
        border: 1px solid var(--border);
        border-radius: 6px;
        cursor: pointer;
        font-size: 18px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
    }

    .explorer-minimized:hover {
        background: var(--bg-secondary);
    }

    .hidden {
        display: none !important;
    }

    .explorer-empty {
        padding: 20px;
        text-align: center;
        color: var(--fg-muted);
    }
`


export default class PerkyExplorer extends HTMLElement {

    #module = null
    #selectedNode = null
    #expandedNodes = new Set()
    #isMinimized = false
    #isCollapsed = false
    #boundListeners = []


    constructor () {
        super()
        this.attachShadow({mode: 'open'})
    }


    connectedCallback () {
        this.#render()
    }


    disconnectedCallback () {
        this.#cleanupListeners()
    }


    setModule (module) {
        this.#cleanupListeners()
        this.#module = module
        this.#selectedNode = null
        this.#expandedNodes.clear()

        if (module) {
            this.#expandedNodes.add(module.$id)
            this.#setupModuleListeners(module)
        }

        this.#render()
    }


    getModule () {
        return this.#module
    }


    #setupModuleListeners (module) {
        const updateHandler = () => this.#render()

        // Listen to childrenRegistry for any add/remove
        const registry = module.childrenRegistry
        if (registry) {
            registry.on('set', updateHandler)
            registry.on('delete', updateHandler)
            this.#boundListeners.push({target: registry, event: 'set', handler: updateHandler})
            this.#boundListeners.push({target: registry, event: 'delete', handler: updateHandler})
        }

        // Listen to module lifecycle
        module.on('start', updateHandler)
        module.on('stop', updateHandler)
        this.#boundListeners.push({target: module, event: 'start', handler: updateHandler})
        this.#boundListeners.push({target: module, event: 'stop', handler: updateHandler})

        // Recursively setup listeners for children
        for (const child of module.children) {
            this.#setupModuleListeners(child)
        }
    }




    #cleanupListeners () {
        for (const {target, event, handler} of this.#boundListeners) {
            target.off(event, handler)
        }
        this.#boundListeners = []
    }


    #render () {
        const styleElement = document.createElement('style')
        styleElement.textContent = styles

        this.shadowRoot.innerHTML = ''
        this.shadowRoot.appendChild(styleElement)

        if (this.#isMinimized) {
            this.shadowRoot.appendChild(this.#createMinimizedView())
        } else {
            this.shadowRoot.appendChild(this.#createExpandedView())
        }
    }


    #createMinimizedView () {
        const container = document.createElement('div')
        container.className = 'explorer-minimized'
        container.textContent = '📦'
        container.addEventListener('click', () => {
            this.#isMinimized = false
            this.#render()
        })
        return container
    }


    #createExpandedView () {
        const explorer = document.createElement('div')
        explorer.className = 'explorer'

        explorer.appendChild(this.#createHeader())
        explorer.appendChild(this.#createTree())

        if (this.#selectedNode) {
            explorer.appendChild(this.#createDetails())
        }

        return explorer
    }


    #createHeader () {
        const header = document.createElement('div')
        header.className = 'explorer-header'

        const title = document.createElement('div')
        title.className = 'explorer-title'
        title.innerHTML = '<span class="explorer-title-icon">📦</span> Module Explorer'

        const buttons = document.createElement('div')
        buttons.className = 'explorer-buttons'

        const refreshBtn = document.createElement('button')
        refreshBtn.className = 'explorer-btn'
        refreshBtn.textContent = '↻'
        refreshBtn.title = 'Refresh'
        refreshBtn.addEventListener('click', (e) => {
            e.stopPropagation()
            this.#render()
        })

        const collapseBtn = document.createElement('button')
        collapseBtn.className = 'explorer-btn'
        collapseBtn.textContent = this.#isCollapsed ? '+' : '−'
        collapseBtn.title = this.#isCollapsed ? 'Expand' : 'Collapse'
        collapseBtn.addEventListener('click', (e) => {
            e.stopPropagation()
            this.#isCollapsed = !this.#isCollapsed
            this.#render()
        })

        const minimizeBtn = document.createElement('button')
        minimizeBtn.className = 'explorer-btn'
        minimizeBtn.textContent = '◻'
        minimizeBtn.title = 'Minimize'
        minimizeBtn.addEventListener('click', (e) => {
            e.stopPropagation()
            this.#isMinimized = true
            this.#render()
        })

        buttons.appendChild(refreshBtn)
        buttons.appendChild(collapseBtn)
        buttons.appendChild(minimizeBtn)

        header.appendChild(title)
        header.appendChild(buttons)

        header.addEventListener('click', () => {
            this.#isCollapsed = !this.#isCollapsed
            this.#render()
        })

        return header
    }


    #createTree () {
        const tree = document.createElement('div')
        tree.className = `explorer-tree ${this.#isCollapsed ? 'hidden' : ''}`

        if (!this.#module) {
            const empty = document.createElement('div')
            empty.className = 'explorer-empty'
            empty.textContent = 'No module attached. Use setModule() to explore.'
            tree.appendChild(empty)
            return tree
        }

        tree.appendChild(this.#createTreeNode(this.#module, 0))
        return tree
    }


    #createTreeNode (module, depth) {
        const node = document.createElement('div')
        node.className = 'tree-node'

        const content = document.createElement('div')
        content.className = 'tree-node-content'
        content.style.setProperty('--depth', depth)

        if (this.#selectedNode === module) {
            content.classList.add('selected')
        }

        const children = module.children || []
        const hasChildren = children.length > 0
        const isExpanded = this.#expandedNodes.has(module.$id)

        // Toggle arrow
        const toggle = document.createElement('div')
        toggle.className = `tree-toggle ${hasChildren ? 'has-children' : ''}`
        if (hasChildren) {
            toggle.textContent = isExpanded ? '▼' : '▶'
            toggle.addEventListener('click', (e) => {
                e.stopPropagation()
                if (isExpanded) {
                    this.#expandedNodes.delete(module.$id)
                } else {
                    this.#expandedNodes.add(module.$id)
                }
                this.#render()
            })
        }

        // Status indicator
        const status = document.createElement('div')
        status.className = 'tree-status'
        status.classList.add(module.$status)
        status.title = module.$status.charAt(0).toUpperCase() + module.$status.slice(1)

        // ID
        const id = document.createElement('div')
        id.className = 'tree-id'
        id.textContent = module.$id
        id.title = module.$id

        // Category badge
        const category = document.createElement('div')
        category.className = 'tree-category'
        category.textContent = module.$category

        content.appendChild(toggle)
        content.appendChild(status)
        content.appendChild(id)
        content.appendChild(category)

        content.addEventListener('click', () => {
            this.#selectedNode = module
            this.#render()
        })

        node.appendChild(content)

        // Children container
        if (hasChildren) {
            const childrenContainer = document.createElement('div')
            childrenContainer.className = `tree-children ${isExpanded ? 'expanded' : ''}`

            for (const child of children) {
                childrenContainer.appendChild(this.#createTreeNode(child, depth + 1))
            }

            node.appendChild(childrenContainer)
        }

        return node
    }


    #createDetails () {
        const details = document.createElement('div')
        details.className = `explorer-details ${this.#isCollapsed ? 'hidden' : ''}`

        const module = this.#selectedNode

        const title = document.createElement('div')
        title.className = 'details-title'

        const statusDot = document.createElement('div')
        statusDot.className = 'tree-status'
        statusDot.classList.add(module.$status)

        title.appendChild(statusDot)
        title.appendChild(document.createTextNode(module.$id))

        const grid = document.createElement('div')
        grid.className = 'details-grid'

        const addRow = (label, value, isAccent = false) => {
            const labelEl = document.createElement('div')
            labelEl.className = 'details-label'
            labelEl.textContent = label

            const valueEl = document.createElement('div')
            valueEl.className = `details-value ${isAccent ? 'accent' : ''}`

            if (typeof value === 'string' || typeof value === 'number') {
                valueEl.textContent = value
                valueEl.title = String(value)
            } else {
                valueEl.appendChild(value)
            }

            grid.appendChild(labelEl)
            grid.appendChild(valueEl)
        }

        addRow('$name', module.$name)
        addRow('$category', module.$category)

        const tags = module.$tags || []
        if (tags.length > 0) {
            const tagsContainer = document.createElement('div')
            tagsContainer.className = 'details-tags'
            for (const tag of tags) {
                const tagEl = document.createElement('span')
                tagEl.className = 'details-tag'
                tagEl.textContent = tag
                tagsContainer.appendChild(tagEl)
            }
            addRow('$tags', tagsContainer)
        } else {
            addRow('$tags', '(none)')
        }

        addRow('$status', module.$status)
        addRow('installed', module.installed ? 'yes' : 'no')
        addRow('children', (module.children || []).length, true)

        details.appendChild(title)
        details.appendChild(grid)

        return details
    }

}


customElements.define('perky-explorer', PerkyExplorer)
