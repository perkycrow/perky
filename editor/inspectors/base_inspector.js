import BaseEditorComponent from '../base_editor_component.js'
import {cssVariables, inspectorStyles} from '../perky_explorer_styles.js'


export default class BaseInspector extends BaseEditorComponent {

    #module = null
    #gridEl = null
    #actionsEl = null
    #customStyles = ''


    constructor (customStyles = '') {
        super()
        this.#customStyles = customStyles
    }


    disconnectedCallback () {
        super.disconnectedCallback()
    }


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
        const style = document.createElement('style')
        style.textContent = this.#getStyles()
        this.shadowRoot.appendChild(style)

        this.#gridEl = document.createElement('div')
        this.#gridEl.className = 'inspector-grid'

        this.#actionsEl = document.createElement('div')
        this.#actionsEl.className = 'inspector-actions'

        this.shadowRoot.appendChild(this.#gridEl)
        this.shadowRoot.appendChild(this.#actionsEl)
    }


    #getStyles () {
        return `
            :host {
                ${cssVariables}
                display: block;
            }
            ${inspectorStyles}
            ${this.#customStyles}
        `
    }


    addRow (label, value, isAccent = false) {
        const labelEl = document.createElement('div')
        labelEl.className = 'inspector-label'
        labelEl.textContent = label

        const valueEl = document.createElement('div')
        valueEl.className = `inspector-value ${isAccent ? 'accent' : ''}`

        const displayValue = typeof value === 'function' ? value() : value
        valueEl.textContent = String(displayValue)
        valueEl.title = String(displayValue)

        this.#gridEl.appendChild(labelEl)
        this.#gridEl.appendChild(valueEl)

        return valueEl
    }


    addSeparator () {
        const sep = document.createElement('div')
        sep.className = 'inspector-separator'
        this.#gridEl.appendChild(sep)
    }


    createButton (icon, text, onClick) { // eslint-disable-line class-methods-use-this
        const btn = document.createElement('button')
        btn.className = 'inspector-btn'
        btn.textContent = icon ? `${icon} ${text}` : text
        btn.addEventListener('click', onClick)
        return btn
    }


    clearContent () {
        this.#gridEl.innerHTML = ''
        this.#actionsEl.innerHTML = ''
    }

}
