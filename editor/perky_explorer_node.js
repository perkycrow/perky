import BaseTreeNode from './base_tree_node.js'
import {ICONS} from './devtools/devtools_icons.js'
import {createElement} from '../application/dom_utils.js'


export default class PerkyExplorerNode extends BaseTreeNode {

    static childNodeTag = 'perky-explorer-node'

    #module = null
    #childNodes = new Map()
    #isSystemModule = false

    onDisconnected () {
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
        return this.getChildren().length > 0
    }


    getChildren () {
        if (!this.#module) {
            return []
        }

        const explorer = this.#getExplorer()
        if (!explorer || explorer.showSystemModules || this.depth > 0) {
            return this.#module.children
        }

        return this.#module.children.filter(child => !explorer.isSystemModule(child))
    }


    #getExplorer () {
        let current = this
        while (current) {
            if (current.tagName === 'PERKY-EXPLORER') {
                return current
            }
            const root = current.getRootNode()
            if (root && root.host) {
                current = root.host
            } else {
                current = current.parentElement
            }
        }
        return null
    }


    createChildNode (child) {
        const childNode = document.createElement('perky-explorer-node')
        const explorer = this.#getExplorer()
        if (explorer?.isSystemModule(child)) {
            childNode.setSystemModule(true)
        }
        childNode.setModule(child, this.depth + 1)
        this.#childNodes.set(child.$id, childNode)
        return childNode
    }


    renderNodeContent () {
        this.#updateStatus()
        this.#updateId()
        this.#updateCategory()
        this.#updateSystemClass()
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
        const filteredChildren = this.getChildren()

        for (const child of filteredChildren) {
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
            statusEl = createElement('div', {class: 'node-status'})
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
            idEl = createElement('div', {class: 'node-id'})
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
            categoryEl = createElement('div', {class: 'node-category'})
            this.contentEl.appendChild(categoryEl)
        }

        categoryEl.textContent = this.#module.$category
    }


    setSystemModule (value) {
        this.#isSystemModule = value
        this.#updateSystemClass()
    }


    #updateSystemClass () {
        if (!this.contentEl) {
            return
        }
        let iconEl = this.contentEl.querySelector('.node-system-icon')

        if (this.#isSystemModule) {
            if (!iconEl) {
                iconEl = createElement('span', {
                    class: 'node-system-icon',
                    html: ICONS.system,
                    title: 'System module'
                })
                this.contentEl.appendChild(iconEl)
            }
        } else if (iconEl) {
            iconEl.remove()
        }
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
