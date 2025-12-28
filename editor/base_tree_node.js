import BaseEditorComponent from './base_editor_component.js'
import {nodeStyles, cssVariables} from './perky_explorer_styles.js'


export default class BaseTreeNode extends BaseEditorComponent {

    static childNodeTag = null

    #depth = 0
    #expanded = false
    #selected = false

    #contentEl = null
    #toggleEl = null
    #childrenEl = null

    #customStyles = ''


    constructor (customStyles = '') {
        super()
        this.#customStyles = customStyles
        this.#buildDOM()
    }

    getItem () { // eslint-disable-line class-methods-use-this
        throw new Error('getItem() must be implemented by subclass')
    }


    hasChildren () { // eslint-disable-line class-methods-use-this
        throw new Error('hasChildren() must be implemented by subclass')
    }


    getChildren () { // eslint-disable-line class-methods-use-this
        throw new Error('getChildren() must be implemented by subclass')
    }


    createChildNode (child) { // eslint-disable-line class-methods-use-this, no-unused-vars
        throw new Error('createChildNode() must be implemented by subclass')
    }


    renderNodeContent () { // eslint-disable-line class-methods-use-this
        throw new Error('renderNodeContent() must be implemented by subclass')
    }


    get depth () {
        return this.#depth
    }


    get expanded () {
        return this.#expanded
    }


    get selected () {
        return this.#selected
    }


    get contentEl () {
        return this.#contentEl
    }


    get toggleEl () {
        return this.#toggleEl
    }


    get childrenEl () {
        return this.#childrenEl
    }


    setDepth (depth) {
        this.#depth = depth
        this.#updateDepth()
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


    expand () {
        this.setExpanded(true)
    }


    collapse () {
        this.setExpanded(false)
    }


    updateAll () {
        this.#updateDepth()
        this.renderNodeContent()
        this.#updateToggle()
        this.updateChildren()
        this.#updateChildrenVisibility()
    }


    updateChildren () {
        this.clearChildNodes()

        const children = this.getChildren()
        for (const child of children) {
            const childNode = this.createChildNode(child)
            childNode.setDepth(this.#depth + 1)
            this.#childrenEl.appendChild(childNode)
        }
    }


    clearChildNodes () {
        this.#childrenEl.innerHTML = ''
    }


    refreshToggle () {
        this.#updateToggle()
    }


    findNode (predicate) {
        if (predicate(this)) {
            return this
        }

        const childNodeTag = this.constructor.childNodeTag
        if (!childNodeTag) {
            return null
        }

        const children = this.shadowRoot.querySelectorAll(childNodeTag)

        for (const child of children) {
            const found = child.findNode(predicate)
            if (found) {
                return found
            }
        }

        return null
    }


    traverse (fn) {
        fn(this)

        const childNodeTag = this.constructor.childNodeTag
        if (!childNodeTag) {
            return
        }

        const children = this.shadowRoot.querySelectorAll(childNodeTag)

        for (const child of children) {
            child.traverse(fn)
        }
    }


    deselectAll () {
        this.traverse(node => node.setSelected(false))
    }


    emitSelect () {
        this.dispatchEvent(new CustomEvent('node:select', {
            bubbles: true,
            composed: true,
            detail: this.#getSelectDetail()
        }))
    }


    emitToggle () {
        this.dispatchEvent(new CustomEvent('node:toggle', {
            bubbles: true,
            composed: true,
            detail: this.#getToggleDetail()
        }))
    }


    getSelectDetail () { // eslint-disable-line class-methods-use-this
        return {}
    }


    getToggleDetail () {
        return {expanded: this.#expanded}
    }


    #buildDOM () {
        const style = document.createElement('style')
        style.textContent = `:host { ${cssVariables} } ${nodeStyles} ${this.#customStyles}`
        this.shadowRoot.appendChild(style)

        this.#contentEl = document.createElement('div')
        this.#contentEl.className = 'node-content'

        this.#toggleEl = document.createElement('div')
        this.#toggleEl.className = 'node-toggle'
        this.#toggleEl.addEventListener('click', (e) => {
            e.stopPropagation()
            this.#handleToggleClick()
        })

        this.#contentEl.appendChild(this.#toggleEl)
        this.#contentEl.addEventListener('click', () => this.#handleNodeClick())

        this.#childrenEl = document.createElement('div')
        this.#childrenEl.className = 'node-children'

        this.shadowRoot.appendChild(this.#contentEl)
        this.shadowRoot.appendChild(this.#childrenEl)
    }


    #updateDepth () {
        this.#contentEl.style.setProperty('--depth', this.#depth)
    }


    #updateToggle () {
        if (!this.#toggleEl) {
            return
        }

        if (this.hasChildren()) {
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


    #handleToggleClick () {
        this.#expanded = !this.#expanded
        this.#updateChildrenVisibility()
        this.#updateToggle()
        this.emitToggle()
    }


    #handleNodeClick () {
        this.emitSelect()
    }


    #getSelectDetail () {
        return this.getSelectDetail()
    }


    #getToggleDetail () {
        return this.getToggleDetail()
    }

}
