import BaseTreeNode from './base_tree_node.js'


export default class PerkyExplorerNode extends BaseTreeNode {

    static childNodeTag = 'perky-explorer-node'

    #module = null
    #childNodes = new Map()

    constructor () {
        super()
    }


    disconnectedCallback () {
        super.disconnectedCallback()
        this.#clearChildNodes()
    }


    setModule (module, depth = 0) {
        this.setSelected(false)
        this.cleanListeners()
        this.#module = module
        this.setDepth(depth)

        if (module) {
            this.#bindModuleEvents()
            this.updateAll()
        }
    }


    getModule () {
        return this.#module
    }


    getItem () {
        return this.#module
    }


    hasChildren () {
        return this.#module && this.#module.children.length > 0
    }


    getChildren () {
        return this.#module ? this.#module.children : []
    }


    createChildNode (child) {
        const childNode = document.createElement('perky-explorer-node')
        childNode.setModule(child, this.depth + 1)
        this.#childNodes.set(child.$id, childNode)
        return childNode
    }


    renderNodeContent () {
        this.#updateStatus()
        this.#updateId()
        this.#updateCategory()
    }


    getSelectDetail () {
        return {module: this.#module}
    }


    getToggleDetail () {
        return {module: this.#module, expanded: this.expanded}
    }


    updateChildren () {
        if (!this.#module) {
            return
        }

        const currentIds = new Set(this.#childNodes.keys())
        const moduleChildren = this.#module.children

        for (const child of moduleChildren) {
            if (!this.#childNodes.has(child.$id)) {
                const childNode = this.createChildNode(child)
                this.childrenEl.appendChild(childNode)
            }
            currentIds.delete(child.$id)
        }

        for (const removedId of currentIds) {
            this.#removeChildNode(removedId)
        }
    }


    clearChildNodes () {
        this.#clearChildNodes()
    }


    #bindModuleEvents () {
        if (!this.#module) {
            return
        }

        const module = this.#module

        this.listenTo(module, 'start', () => this.#updateStatus())
        this.listenTo(module, 'stop', () => this.#updateStatus())

        const registry = module.childrenRegistry
        if (registry) {
            this.listenTo(registry, 'set', (id, child) => this.#handleChildAdded(id, child))
            this.listenTo(registry, 'delete', (id) => this.#handleChildRemoved(id))
        }

        this.listenTo(module, '$id:changed', () => this.#updateId())
        this.listenTo(module, '$category:changed', () => this.#updateCategory())
    }


    #updateStatus () {
        if (!this.#module) {
            return
        }

        let statusEl = this.contentEl.querySelector('.node-status')
        if (!statusEl) {
            statusEl = document.createElement('div')
            statusEl.className = 'node-status'
            this.contentEl.insertBefore(statusEl, this.toggleEl.nextSibling)
        }

        const status = this.#module.$status
        statusEl.className = `node-status ${status}`
        statusEl.title = status.charAt(0).toUpperCase() + status.slice(1)
    }


    #updateId () {
        if (!this.#module) {
            return
        }

        let idEl = this.contentEl.querySelector('.node-id')
        if (!idEl) {
            idEl = document.createElement('div')
            idEl.className = 'node-id'
            this.contentEl.appendChild(idEl)
        }

        idEl.textContent = this.#module.$id
        idEl.title = this.#module.$id
    }


    #updateCategory () {
        if (!this.#module) {
            return
        }

        let categoryEl = this.contentEl.querySelector('.node-category')
        if (!categoryEl) {
            categoryEl = document.createElement('div')
            categoryEl.className = 'node-category'
            this.contentEl.appendChild(categoryEl)
        }

        categoryEl.textContent = this.#module.$category
    }


    #clearChildNodes () {
        for (const childNode of this.#childNodes.values()) {
            childNode.remove()
        }
        this.#childNodes.clear()
    }


    #removeChildNode (childId) {
        const childNode = this.#childNodes.get(childId)
        if (childNode) {
            childNode.remove()
            this.#childNodes.delete(childId)
        }
    }


    #handleChildAdded (id, child) {
        if (!this.#childNodes.has(id)) {
            const childNode = this.createChildNode(child)
            this.childrenEl.appendChild(childNode)
            this.refreshToggle()
        }
    }


    #handleChildRemoved (id) {
        this.#removeChildNode(id)
        this.refreshToggle()
    }

}


customElements.define('perky-explorer-node', PerkyExplorerNode)
