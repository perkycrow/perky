import EditorComponent from './editor_component.js'
import {controlsSheet} from './styles/index.js'
import {emitChange, handleAttributeChange} from './base_input.js'
import {createElement} from '../application/dom_utils.js'


const toggleInputCSS = `
    .toggle-input-container {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        cursor: pointer;
    }

    .toggle-input-track {
        position: relative;
        width: 28px;
        height: 14px;
        background: var(--bg-hover);
        border-radius: 7px;
        transition: background var(--transition-normal);
        flex-shrink: 0;
    }

    .toggle-input-track.checked {
        background: var(--accent);
    }

    .toggle-input-thumb {
        position: absolute;
        top: 2px;
        left: 2px;
        width: 10px;
        height: 10px;
        background: var(--fg-muted);
        border-radius: 50%;
        transition: transform var(--transition-normal), background var(--transition-normal);
    }

    .toggle-input-track.checked .toggle-input-thumb {
        transform: translateX(14px);
        background: var(--bg-primary);
    }

    .toggle-input-label {
        font-size: var(--font-size-sm);
        color: var(--fg-primary);
        font-weight: 500;
        user-select: none;
        -webkit-user-select: none;
    }

    .toggle-input-label:empty {
        display: none;
    }

    .toggle-input-container:hover .toggle-input-track:not(.checked) {
        background: var(--bg-selected);
    }

    .toggle-input-container:hover .toggle-input-thumb {
        background: var(--fg-secondary);
    }

    .toggle-input-track.checked:hover .toggle-input-thumb {
        background: var(--bg-primary);
    }


    :host([context="studio"]) .toggle-input-container {
        gap: var(--spacing-md);
    }

    :host([context="studio"]) .toggle-input-track {
        width: 52px;
        height: 32px;
        border-radius: 16px;
    }

    :host([context="studio"]) .toggle-input-thumb {
        top: 4px;
        left: 4px;
        width: 24px;
        height: 24px;
    }

    :host([context="studio"]) .toggle-input-track.checked .toggle-input-thumb {
        transform: translateX(20px);
    }

    :host([context="studio"]) .toggle-input-label {
        font-size: var(--font-size-lg);
    }
`


export default class ToggleInput extends EditorComponent {

    static styles = [controlsSheet, toggleInputCSS]

    #checked = false
    #label = ''

    #toggle = null
    #labelEl = null

    static get observedAttributes () {
        return ['checked', 'label']
    }


    constructor () {
        super()
        this.#buildDOM()
    }


    onConnected () {
        this.#updateDisplay()
    }


    attributeChangedCallback (name, oldValue, newValue) {
        handleAttributeChange(this, name, oldValue, newValue)
    }


    get checked () {
        return this.#checked
    }


    set checked (val) {
        const newChecked = Boolean(val)
        if (this.#checked !== newChecked) {
            this.#checked = newChecked
            this.#updateDisplay()
        }
    }


    setChecked (val) {
        this.#checked = val
        this.#updateDisplay()
    }


    setLabel (val) {
        this.#label = val
        if (this.#labelEl) {
            this.#labelEl.textContent = this.#label
        }
    }


    #buildDOM () {
        const container = createElement('div', {class: 'toggle-input-container'})

        this.#toggle = createElement('div', {class: 'toggle-input-track'})
        this.#toggle.addEventListener('click', () => this.#handleClick())

        const thumb = createElement('div', {class: 'toggle-input-thumb'})
        this.#toggle.appendChild(thumb)

        this.#labelEl = createElement('span', {
            class: 'toggle-input-label',
            text: this.#label
        })
        this.#labelEl.addEventListener('click', () => this.#handleClick())

        container.appendChild(this.#toggle)
        container.appendChild(this.#labelEl)

        this.shadowRoot.appendChild(container)
    }


    #updateDisplay () {
        if (this.#toggle) {
            this.#toggle.classList.toggle('checked', this.#checked)
        }
    }


    #handleClick () {
        this.#checked = !this.#checked
        this.#updateDisplay()
        emitChange(this, {checked: this.#checked})
    }

}


customElements.define('toggle-input', ToggleInput)
