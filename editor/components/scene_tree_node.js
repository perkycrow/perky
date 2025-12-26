import {nodeStyles, cssVariables} from './perky_explorer_styles.js'


export default class SceneTreeNode extends HTMLElement {

    #object = null
    #depth = 0
    #expanded = false
    #selected = false

    #contentEl = null
    #toggleEl = null
    #labelEl = null
    #propsEl = null
    #childrenEl = null

    #childNodes = []


    constructor () {
        super()
        this.attachShadow({mode: 'open'})
        this.#buildDOM()
    }


    setObject (object, depth = 0) {
        this.#object = object
        this.#depth = depth
        this.#updateAll()
    }


    getObject () {
        return this.#object
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


    refresh () {
        this.#updateAll()
    }


    #buildDOM () {
        const style = document.createElement('style')
        style.textContent = `:host { ${cssVariables} } ${nodeStyles} ${sceneTreeNodeStyles}`
        this.shadowRoot.appendChild(style)

        this.#contentEl = document.createElement('div')
        this.#contentEl.className = 'node-content'

        this.#toggleEl = document.createElement('div')
        this.#toggleEl.className = 'node-toggle'
        this.#toggleEl.addEventListener('click', (e) => {
            e.stopPropagation()
            this.#handleToggleClick()
        })

        this.#labelEl = document.createElement('div')
        this.#labelEl.className = 'node-label'

        this.#propsEl = document.createElement('div')
        this.#propsEl.className = 'node-props'

        this.#contentEl.appendChild(this.#toggleEl)
        this.#contentEl.appendChild(this.#labelEl)
        this.#contentEl.appendChild(this.#propsEl)

        this.#contentEl.addEventListener('click', () => this.#handleNodeClick())

        this.#childrenEl = document.createElement('div')
        this.#childrenEl.className = 'node-children'

        this.shadowRoot.appendChild(this.#contentEl)
        this.shadowRoot.appendChild(this.#childrenEl)
    }


    #updateAll () {
        this.#updateDepth()
        this.#updateLabel()
        this.#updateProps()
        this.#updateToggle()
        this.#updateChildren()
        this.#updateChildrenVisibility()
    }


    #updateDepth () {
        this.#contentEl.style.setProperty('--depth', this.#depth)
    }


    #updateLabel () {
        if (!this.#object || !this.#labelEl) {
            return
        }

        this.#labelEl.textContent = this.#object.constructor.name
    }


    #updateProps () {
        if (!this.#object || !this.#propsEl) {
            return
        }

        const obj = this.#object
        const x = formatNumber(obj.x)
        const y = formatNumber(obj.y)
        this.#propsEl.textContent = `(${x}, ${y})`
        this.#propsEl.title = `x: ${obj.x}, y: ${obj.y}, rotation: ${obj.rotation}, scale: (${obj.scaleX}, ${obj.scaleY})`
    }


    #updateToggle () {
        if (!this.#toggleEl) {
            return
        }

        const hasChildren = this.#object && this.#object.children && this.#object.children.length > 0

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
        if (!this.#object) {
            return
        }

        this.#clearChildNodes()

        const children = this.#object.children || []

        for (const child of children) {
            this.#createChildNode(child)
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


    #clearChildNodes () {
        for (const childNode of this.#childNodes) {
            childNode.remove()
        }
        this.#childNodes = []
    }


    #createChildNode (child) {
        const childNode = document.createElement('scene-tree-node')
        childNode.setObject(child, this.#depth + 1)
        this.#childrenEl.appendChild(childNode)
        this.#childNodes.push(childNode)
    }


    #handleToggleClick () {
        this.#expanded = !this.#expanded
        this.#updateChildrenVisibility()
        this.#updateToggle()

        this.dispatchEvent(new CustomEvent('node:toggle', {
            bubbles: true,
            composed: true,
            detail: {object: this.#object, expanded: this.#expanded}
        }))
    }


    #handleNodeClick () {
        this.dispatchEvent(new CustomEvent('node:select', {
            bubbles: true,
            composed: true,
            detail: {object: this.#object}
        }))
    }


    expand () {
        this.setExpanded(true)
    }


    collapse () {
        this.setExpanded(false)
    }

}


function formatNumber (n) {
    return Number.isInteger(n) ? String(n) : n.toFixed(1)
}


const sceneTreeNodeStyles = `
    .node-label {
        color: var(--fg-primary);
        font-weight: 500;
        flex-shrink: 0;
    }

    .node-props {
        color: var(--fg-muted);
        font-size: 10px;
        margin-left: 6px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
`


customElements.define('scene-tree-node', SceneTreeNode)
