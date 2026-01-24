import EditorComponent from '../editor_component.js'
import {inspectorStyles} from '../perky_explorer.styles.js'
import {createElement} from '../../application/dom_utils.js'


export default class BaseInspector extends EditorComponent {

    static styles = `
    :host {
        display: block;
    }
    ${inspectorStyles}
    `

    #module = null
    #gridEl = null
    #actionsEl = null

    setModule (module) {
        this.cleanListeners()
        this.#module = module
        this.onModuleSet?.(module)
    }


    getModule () {
        return this.#module
    }


    get module () {
        return this.#module
    }


    get gridEl () {
        return this.#gridEl
    }


    get actionsEl () {
        return this.#actionsEl
    }


    buildDOM () {
        this.#gridEl = createElement('div', {class: 'inspector-grid'})
        this.#actionsEl = createElement('div', {class: 'inspector-actions'})

        this.shadowRoot.appendChild(this.#gridEl)
        this.shadowRoot.appendChild(this.#actionsEl)
    }


    addRow (label, value, isAccent = false) {
        const labelEl = createElement('div', {class: 'inspector-label', text: label})
        const valueEl = createElement('div', {class: `inspector-value ${isAccent ? 'accent' : ''}`})

        const displayValue = typeof value === 'function' ? value() : value
        valueEl.textContent = String(displayValue)
        valueEl.title = String(displayValue)

        this.#gridEl.appendChild(labelEl)
        this.#gridEl.appendChild(valueEl)

        return valueEl
    }


    addSeparator () {
        const sep = createElement('div', {class: 'inspector-separator'})
        this.#gridEl.appendChild(sep)
    }


    createButton (icon, text, onClick) { // eslint-disable-line local/class-methods-use-this -- clean
        const btn = createElement('button', {class: 'inspector-btn', text: icon ? `${icon} ${text}` : text})
        btn.addEventListener('click', onClick)
        return btn
    }


    clearContent () {
        this.#gridEl.innerHTML = ''
        this.#actionsEl.innerHTML = ''
    }

}
