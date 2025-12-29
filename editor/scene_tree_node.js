import BaseTreeNode from './base_tree_node.js'
import {formatNumber} from '../core/utils.js'


const sceneTreeNodeStyles = `
    .node-label {
        color: var(--fg-primary);
        font-weight: 500;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .node-props {
        color: var(--fg-muted);
        font-size: 10px;
        margin-left: 6px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .node-props.has-entity {
        color: var(--accent);
        cursor: pointer;
    }

    .node-props.has-entity:hover {
        text-decoration: underline;
    }
`


export default class SceneTreeNode extends BaseTreeNode {

    static childNodeTag = 'scene-tree-node'

    #object = null
    #childNodes = []
    #labelEl = null
    #propsEl = null


    constructor () {
        super(sceneTreeNodeStyles)
    }


    setObject (object, depth = 0) {
        this.setSelected(false)
        this.#object = object
        this.setDepth(depth)
        this.updateAll()
    }


    getObject () {
        return this.#object
    }


    refresh () {
        this.updateAll()
    }


    getItem () {
        return this.#object
    }


    hasChildren () {
        return this.#object && this.#object.children && this.#object.children.length > 0
    }


    getChildren () {
        return this.#object?.children || []
    }


    createChildNode (child) {
        const childNode = document.createElement('scene-tree-node')
        childNode.setObject(child, this.depth + 1)
        this.#childNodes.push(childNode)
        return childNode
    }


    renderNodeContent () {
        this.#ensureContentElements()
        this.#updateLabel()
        this.#updateProps()
    }


    getSelectDetail () {
        return {object: this.#object}
    }


    getToggleDetail () {
        return {object: this.#object, expanded: this.expanded}
    }


    clearChildNodes () {
        for (const childNode of this.#childNodes) {
            childNode.remove()
        }
        this.#childNodes = []
    }


    #ensureContentElements () {
        if (!this.#labelEl) {
            this.#labelEl = document.createElement('div')
            this.#labelEl.className = 'node-label'
            this.contentEl.appendChild(this.#labelEl)
        }

        if (!this.#propsEl) {
            this.#propsEl = document.createElement('div')
            this.#propsEl.className = 'node-props'
            this.#propsEl.addEventListener('click', (e) => {
                if (this.#object?.$entity) {
                    e.stopPropagation()
                    this.#handleEntityClick()
                }
            })
            this.contentEl.appendChild(this.#propsEl)
        }
    }


    #updateLabel () {
        if (!this.#object || !this.#labelEl) {
            return
        }

        const obj = this.#object
        if (obj.$rendererName) {
            this.#labelEl.textContent = obj.$rendererName
            this.#labelEl.title = `Renderer: ${obj.$rendererName}`
        } else {
            this.#labelEl.textContent = obj.constructor.name
        }
    }


    #updateProps () {
        if (!this.#object || !this.#propsEl) {
            return
        }

        const obj = this.#object

        if (obj.$entity) {
            this.#propsEl.textContent = `→ ${obj.$entity.$id}`
            this.#propsEl.title = `Entity: ${obj.$entity.$id} (${obj.$entity.constructor.name})`
            this.#propsEl.classList.add('has-entity')
        } else {
            const x = formatNumber(obj.x)
            const y = formatNumber(obj.y)
            this.#propsEl.textContent = `(${x}, ${y})`
            this.#propsEl.title = `x: ${obj.x}, y: ${obj.y}, rotation: ${obj.rotation}, scale: (${obj.scaleX}, ${obj.scaleY})`
            this.#propsEl.classList.remove('has-entity')
        }
    }


    #handleEntityClick () {
        this.dispatchEvent(new CustomEvent('navigate:entity', {
            bubbles: true,
            composed: true,
            detail: {entity: this.#object.$entity}
        }))
    }

}


customElements.define('scene-tree-node', SceneTreeNode)
