import {createInputStyles, emitChange, handleAttributeChange} from './base_input.js'
import './number_input.js'


const vec2Styles = createInputStyles(`
    :host {
        display: block;
        width: 100%;
        box-sizing: border-box;
    }

    .vec2-input-container {
        display: flex;
        flex-direction: column;
        gap: 4px;
        width: 100%;
    }

    .vec2-input-label {
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: var(--fg-muted);
    }

    .vec2-input-label:empty {
        display: none;
    }

    .vec2-inputs {
        display: flex;
        gap: 8px;
        width: 100%;
    }

    .vec2-inputs number-input {
        flex: 1;
        min-width: 0;
    }
`)


export default class Vec2Input extends HTMLElement {

    #vec2 = null
    #xInput = null
    #yInput = null
    #label = ''
    #labelEl = null


    static get observedAttributes () {
        return ['label']
    }


    constructor () {
        super()
        this.attachShadow({mode: 'open'})
        this.#buildDOM()
    }


    connectedCallback () {
        this.#updateDisplay()
    }


    attributeChangedCallback (name, oldValue, newValue) {
        handleAttributeChange(this, name, oldValue, newValue)
    }


    get value () {
        return this.#vec2
    }


    set value (vec2) {
        this.#vec2 = vec2
        this.#updateDisplay()
    }


    setLabel (val) {
        this.#label = val
        if (this.#labelEl) {
            this.#labelEl.textContent = this.#label
        }
    }


    #buildDOM () {
        const style = document.createElement('style')
        style.textContent = vec2Styles
        this.shadowRoot.appendChild(style)

        const container = document.createElement('div')
        container.className = 'vec2-input-container'

        this.#labelEl = document.createElement('span')
        this.#labelEl.className = 'vec2-input-label'
        this.#labelEl.textContent = this.#label

        const inputs = document.createElement('div')
        inputs.className = 'vec2-inputs'

        this.#xInput = document.createElement('number-input')
        this.#xInput.setAttribute('label', 'x')
        this.#xInput.setAttribute('step', '0.1')
        this.#xInput.setAttribute('precision', '2')
        this.#xInput.addEventListener('change', (e) => this.#handleChange('x', e.detail.value))

        this.#yInput = document.createElement('number-input')
        this.#yInput.setAttribute('label', 'y')
        this.#yInput.setAttribute('step', '0.1')
        this.#yInput.setAttribute('precision', '2')
        this.#yInput.addEventListener('change', (e) => this.#handleChange('y', e.detail.value))

        inputs.appendChild(this.#xInput)
        inputs.appendChild(this.#yInput)

        container.appendChild(this.#labelEl)
        container.appendChild(inputs)

        this.shadowRoot.appendChild(container)
    }


    #updateDisplay () {
        if (!this.#vec2) {
            return
        }

        this.#xInput.value = this.#vec2.x
        this.#yInput.value = this.#vec2.y
    }


    #handleChange (axis, value) {
        if (!this.#vec2) {
            return
        }

        this.#vec2[axis] = value
        emitChange(this, {value: this.#vec2, axis, componentValue: value})
    }

}


customElements.define('vec2-input', Vec2Input)
