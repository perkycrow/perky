import {inspectorStyles, cssVariables} from '../components/perky_explorer_styles.js'
import Object2D from '../../render/object_2d.js'


export default class Object2DInspector extends HTMLElement {

    #object = null
    #gridEl = null


    constructor () {
        super()
        this.attachShadow({mode: 'open'})
    }


    connectedCallback () {
        this.#buildDOM()
        this.#render()
    }


    setObject (object) {
        this.#object = object
        this.#render()
    }


    getObject () {
        return this.#object
    }


    #buildDOM () {
        const style = document.createElement('style')
        style.textContent = `:host { ${cssVariables} } ${inspectorStyles} ${object2DInspectorStyles}`
        this.shadowRoot.appendChild(style)

        this.#gridEl = document.createElement('div')
        this.#gridEl.className = 'inspector-grid'
        this.shadowRoot.appendChild(this.#gridEl)
    }


    #render () {
        if (!this.#gridEl || !this.#object) {
            return
        }

        this.#gridEl.innerHTML = ''
        const obj = this.#object

        this.#addRow('class', obj.constructor.name, true)
        this.#addRow('visible', obj.visible ? 'yes' : 'no')
        this.#addRow('opacity', formatNumber(obj.opacity))
        this.#addSeparator()
        this.#addRow('x', formatNumber(obj.x))
        this.#addRow('y', formatNumber(obj.y))
        this.#addRow('rotation', formatNumber(obj.rotation) + ' rad')
        this.#addSeparator()
        this.#addRow('scaleX', formatNumber(obj.scaleX))
        this.#addRow('scaleY', formatNumber(obj.scaleY))
        this.#addSeparator()
        this.#addRow('pivotX', formatNumber(obj.pivotX))
        this.#addRow('pivotY', formatNumber(obj.pivotY))
        this.#addRow('anchorX', formatNumber(obj.anchorX))
        this.#addRow('anchorY', formatNumber(obj.anchorY))

        if (obj.children && obj.children.length > 0) {
            this.#addSeparator()
            this.#addRow('children', obj.children.length, true)
        }
    }


    #addRow (label, value, isAccent = false) {
        const labelEl = document.createElement('div')
        labelEl.className = 'inspector-label'
        labelEl.textContent = label

        const valueEl = document.createElement('div')
        valueEl.className = `inspector-value ${isAccent ? 'accent' : ''}`
        valueEl.textContent = String(value)
        valueEl.title = String(value)

        this.#gridEl.appendChild(labelEl)
        this.#gridEl.appendChild(valueEl)
    }


    #addSeparator () {
        const sep = document.createElement('div')
        sep.className = 'inspector-separator'
        sep.style.gridColumn = '1 / -1'
        sep.style.height = '1px'
        sep.style.background = 'var(--border)'
        sep.style.margin = '6px 0'
        this.#gridEl.appendChild(sep)
    }


    static matches (object) {
        return object instanceof Object2D
    }

}


function formatNumber (n) {
    if (typeof n !== 'number') {
        return String(n)
    }
    return Number.isInteger(n) ? String(n) : n.toFixed(2)
}


const object2DInspectorStyles = `
    :host {
        display: block;
    }
`


customElements.define('object-2d-inspector', Object2DInspector)
