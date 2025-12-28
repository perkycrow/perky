import {cssVariables} from './perky_explorer_styles.js'
import './number_input.js'


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
        if (oldValue === newValue) {
            return
        }

        if (name === 'label') {
            this.#label = newValue || ''
            if (this.#labelEl) {
                this.#labelEl.textContent = this.#label
            }
        }
    }


    get value () {
        return this.#vec2
    }


    set value (vec2) {
        this.#vec2 = vec2
        this.#updateDisplay()
    }


    #buildDOM () {
        const style = document.createElement('style')
        style.textContent = this.#getStyles()
        this.shadowRoot.appendChild(style)

        const container = document.createElement('div')
        container.className = 'vec2-input-container'

        // Optional label
        this.#labelEl = document.createElement('span')
        this.#labelEl.className = 'vec2-input-label'
        this.#labelEl.textContent = this.#label

        // Input fields
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


    #getStyles () {
        return `
            :host {
                ${cssVariables}
                display: block;
                font-family: var(--font-mono);
            }

            .vec2-input-container {
                display: flex;
                flex-direction: column;
                gap: 4px;
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
        `
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

        this.dispatchEvent(new CustomEvent('change', {
            detail: {value: this.#vec2, axis, componentValue: value},
            bubbles: true
        }))
    }

}


customElements.define('vec2-input', Vec2Input)
