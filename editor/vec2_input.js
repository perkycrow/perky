import EditorComponent from './editor_component.js'
import {controlsSheet} from './styles/index.js'
import {emitChange, handleAttributeChange} from './base_input.js'
import {createElement} from '../application/dom_utils.js'
import './number_input.js'


const vec2InputCSS = `
    :host {
        display: block;
        width: 100%;
    }

    .vec2-input-container {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-xs);
        width: 100%;
    }

    .vec2-input-label {
        font-size: var(--font-size-xs);
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: var(--fg-muted);
    }

    .vec2-input-label:empty {
        display: none;
    }

    .vec2-inputs {
        display: flex;
        gap: var(--spacing-sm);
        width: 100%;
    }

    .vec2-inputs number-input {
        flex: 1;
        min-width: 0;
    }


    :host([context="studio"]) .vec2-input-container {
        gap: var(--spacing-sm);
    }

    :host([context="studio"]) .vec2-input-label {
        font-size: var(--font-size-sm);
    }

    :host([context="studio"]) .vec2-inputs {
        gap: var(--spacing-md);
    }

    :host([context="studio"]) .vec2-inputs number-input {
        --input-height: var(--touch-target);
    }
`


export default class Vec2Input extends EditorComponent {

    static styles = [controlsSheet, vec2InputCSS]

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
        this.#buildDOM()
    }


    onConnected () {
        this.#updateDisplay()
        this.#syncContext()
    }


    attributeChangedCallback (name, oldValue, newValue) {
        handleAttributeChange(this, name, oldValue, newValue)
        if (name === 'context') {
            this.#syncContext()
        }
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
        const container = createElement('div', {class: 'vec2-input-container'})

        this.#labelEl = createElement('span', {
            class: 'vec2-input-label',
            text: this.#label
        })

        const inputs = createElement('div', {class: 'vec2-inputs'})

        this.#xInput = createElement('number-input', {
            attrs: {label: 'x', step: '0.1', precision: '2'}
        })
        this.#xInput.addEventListener('change', (e) => this.#handleChange('x', e.detail.value))

        this.#yInput = createElement('number-input', {
            attrs: {label: 'y', step: '0.1', precision: '2'}
        })
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


    #syncContext () {
        const context = this.getAttribute('context')
        if (context) {
            this.#xInput?.setAttribute('context', context)
            this.#yInput?.setAttribute('context', context)
        } else {
            this.#xInput?.removeAttribute('context')
            this.#yInput?.removeAttribute('context')
        }
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
