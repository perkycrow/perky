import {nodeStyles, cssVariables} from './perky_explorer_styles.js'


export default class PerkyExplorerNode extends HTMLElement {

    #module = null
    #depth = 0
    #expanded = false
    #selected = false

    #contentEl = null
    #toggleEl = null
    #statusEl = null
    #idEl = null
    #categoryEl = null
    #childrenEl = null

    #childNodes = new Map()
    #listeners = []


    constructor () {
        super()
        this.attachShadow({mode: 'open'})
        this.#buildDOM()
    }


    disconnectedCallback () {
        this.#unbindModuleEvents()
    }


    setModule (module, depth = 0) {
        this.#unbindModuleEvents()
        this.#module = module
        this.#depth = depth

        if (module) {
            this.#bindModuleEvents()
            this.#updateAll()
        }
    }


    getModule () {
        return this.#module
    }


    setExpanded (expanded) {
        this.#expanded = expanded
        this.#updateChildrenVisibility()
        this.#updateToggle()
    }


    setSelected (selected) {
        this.#selected = selected
        this.#updateSelectedState()
    }


    #buildDOM () {
        const style = document.createElement('style')
        style.textContent = `:host { ${cssVariables} } ${nodeStyles}`
        this.shadowRoot.appendChild(style)

        this.#contentEl = document.createElement('div')
        this.#contentEl.className = 'node-content'

        this.#toggleEl = document.createElement('div')
        this.#toggleEl.className = 'node-toggle'
        this.#toggleEl.addEventListener('click', (e) => {
            e.stopPropagation()
            this.#handleToggleClick()
        })

        this.#statusEl = document.createElement('div')
        this.#statusEl.className = 'node-status'

        this.#idEl = document.createElement('div')
        this.#idEl.className = 'node-id'

        this.#categoryEl = document.createElement('div')
        this.#categoryEl.className = 'node-category'

        this.#contentEl.appendChild(this.#toggleEl)
        this.#contentEl.appendChild(this.#statusEl)
        this.#contentEl.appendChild(this.#idEl)
        this.#contentEl.appendChild(this.#categoryEl)

        this.#contentEl.addEventListener('click', () => this.#handleNodeClick())

        this.#childrenEl = document.createElement('div')
        this.#childrenEl.className = 'node-children'

        this.shadowRoot.appendChild(this.#contentEl)
        this.shadowRoot.appendChild(this.#childrenEl)
    }


    #bindModuleEvents () {
        if (!this.#module) {
            return
        }

        const module = this.#module

        this.#addListener(module, 'start', () => this.#updateStatus())
        this.#addListener(module, 'stop', () => this.#updateStatus())

        const registry = module.childrenRegistry
        if (registry) {
            this.#addListener(registry, 'set', (id, child) => this.#handleChildAdded(id, child))
            this.#addListener(registry, 'delete', (id) => this.#handleChildRemoved(id))
        }

        this.#addListener(module, '$id:changed', () => this.#updateId())
        this.#addListener(module, '$category:changed', () => this.#updateCategory())
    }


    #addListener (target, event, handler) {
        target.on(event, handler)
        this.#listeners.push({target, event, handler})
    }


    #unbindModuleEvents () {
        for (const {target, event, handler} of this.#listeners) {
            target.off(event, handler)
        }
        this.#listeners = []
        this.#clearChildNodes()
    }


    #clearChildNodes () {
        for (const childNode of this.#childNodes.values()) {
            childNode.remove()
        }
        this.#childNodes.clear()
    }


    #updateAll () {
        this.#updateDepth()
        this.#updateStatus()
        this.#updateId()
        this.#updateCategory()
        this.#updateToggle()
        this.#updateChildren()
        this.#updateChildrenVisibility()
    }


    #updateDepth () {
        this.#contentEl.style.setProperty('--depth', this.#depth)
    }


    #updateStatus () {
        if (!this.#module || !this.#statusEl) {
            return
        }

        const status = this.#module.$status
        this.#statusEl.className = `node-status ${status}`
        this.#statusEl.title = status.charAt(0).toUpperCase() + status.slice(1)
    }


    #updateId () {
        if (!this.#module || !this.#idEl) {
            return
        }

        this.#idEl.textContent = this.#module.$id
        this.#idEl.title = this.#module.$id
    }


    #updateCategory () {
        if (!this.#module || !this.#categoryEl) {
            return
        }

        this.#categoryEl.textContent = this.#module.$category
    }


    #updateToggle () {
        if (!this.#toggleEl) {
            return
        }

        const hasChildren = this.#module && this.#module.children.length > 0

        if (hasChildren) {
            this.#toggleEl.classList.add('has-children')
            this.#toggleEl.textContent = this.#expanded ? '▼' : '▶'
        } else {
            this.#toggleEl.classList.remove('has-children')
            this.#toggleEl.textContent = ''
        }
    }


    #updateSelectedState () {
        if (!this.#contentEl) {
            return
        }

        if (this.#selected) {
            this.#contentEl.classList.add('selected')
        } else {
            this.#contentEl.classList.remove('selected')
        }
    }


    #updateChildren () {
        if (!this.#module) {
            return
        }

        const currentIds = new Set(this.#childNodes.keys())
        const moduleChildren = this.#module.children

        for (const child of moduleChildren) {
            if (!this.#childNodes.has(child.$id)) {
                this.#createChildNode(child)
            }
            currentIds.delete(child.$id)
        }

        for (const removedId of currentIds) {
            this.#removeChildNode(removedId)
        }
    }


    #updateChildrenVisibility () {
        if (!this.#childrenEl) {
            return
        }

        if (this.#expanded) {
            this.#childrenEl.classList.add('expanded')
        } else {
            this.#childrenEl.classList.remove('expanded')
        }
    }


    #createChildNode (child) {
        const childNode = document.createElement('perky-explorer-node')
        childNode.setModule(child, this.#depth + 1)
        this.#childrenEl.appendChild(childNode)
        this.#childNodes.set(child.$id, childNode)
    }


    #removeChildNode (childId) {
        const childNode = this.#childNodes.get(childId)
        if (childNode) {
            childNode.remove()
            this.#childNodes.delete(childId)
        }
    }


    #handleToggleClick () {
        this.#expanded = !this.#expanded
        this.#updateChildrenVisibility()
        this.#updateToggle()

        this.dispatchEvent(new CustomEvent('node:toggle', {
            bubbles: true,
            composed: true,
            detail: {module: this.#module, expanded: this.#expanded}
        }))
    }


    #handleNodeClick () {
        this.dispatchEvent(new CustomEvent('node:select', {
            bubbles: true,
            composed: true,
            detail: {module: this.#module}
        }))
    }


    #handleChildAdded (id, child) {
        if (!this.#childNodes.has(id)) {
            this.#createChildNode(child)
            this.#updateToggle()
        }
    }


    #handleChildRemoved (id) {
        this.#removeChildNode(id)
        this.#updateToggle()
    }


    expand () {
        this.setExpanded(true)
    }


    collapse () {
        this.setExpanded(false)
    }

}


customElements.define('perky-explorer-node', PerkyExplorerNode)

