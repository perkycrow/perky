import {createInputStyles, emitChange, handleAttributeChange} from './base_input.js'


const volumeStyles = createInputStyles(`
    .volume-input-container {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .volume-input-label {
        font-size: 10px;
        color: var(--fg-muted);
        min-width: 60px;
    }

    .volume-input-label:empty {
        display: none;
    }

    .volume-input-track {
        flex: 1;
        height: 4px;
        -webkit-appearance: none;
        appearance: none;
        background: transparent;
        cursor: pointer;
    }

    .volume-input-track::-webkit-slider-runnable-track {
        height: 4px;
        background: var(--bg-hover);
        border-radius: 2px;
    }

    .volume-input-track::-moz-range-track {
        height: 4px;
        background: var(--bg-hover);
        border-radius: 2px;
        border: none;
    }

    .volume-input-track::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 12px;
        height: 12px;
        background: var(--accent);
        border-radius: 50%;
        cursor: pointer;
        margin-top: -4px;
        transition: transform 0.1s, box-shadow 0.1s;
    }

    .volume-input-track::-webkit-slider-thumb:hover {
        transform: scale(1.2);
        box-shadow: 0 0 6px var(--accent);
    }

    .volume-input-track::-moz-range-thumb {
        width: 12px;
        height: 12px;
        background: var(--accent);
        border: none;
        border-radius: 50%;
        cursor: pointer;
    }

    .volume-input-value {
        font-size: 10px;
        color: var(--fg-secondary);
        min-width: 32px;
        text-align: right;
        font-variant-numeric: tabular-nums;
    }
`)


function formatVolumeValue (value) {
    return `${Math.round(value * 100)}%`
}


export default class VolumeInput extends HTMLElement {

    #value = 1
    #label = ''

    #slider = null
    #labelEl = null
    #valueEl = null

    static get observedAttributes () {
        return ['value', 'label']
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
        return this.#value
    }


    set value (val) {
        const newValue = Math.max(0, Math.min(1, parseFloat(val) || 0))
        if (this.#value !== newValue) {
            this.#value = newValue
            this.#updateDisplay()
        }
    }


    setValue (val) {
        this.#value = Math.max(0, Math.min(1, val))
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
        style.textContent = volumeStyles
        this.shadowRoot.appendChild(style)

        const container = document.createElement('div')
        container.className = 'volume-input-container'

        this.#labelEl = document.createElement('span')
        this.#labelEl.className = 'volume-input-label'
        this.#labelEl.textContent = this.#label

        this.#slider = document.createElement('input')
        this.#slider.type = 'range'
        this.#slider.className = 'volume-input-track'
        this.#slider.min = 0
        this.#slider.max = 1
        this.#slider.step = 0.01
        this.#slider.addEventListener('input', () => this.#handleInput())

        this.#valueEl = document.createElement('span')
        this.#valueEl.className = 'volume-input-value'

        container.appendChild(this.#labelEl)
        container.appendChild(this.#slider)
        container.appendChild(this.#valueEl)

        this.shadowRoot.appendChild(container)
    }


    #updateDisplay () {
        if (this.#slider) {
            this.#slider.value = this.#value
        }
        if (this.#valueEl) {
            this.#valueEl.textContent = formatVolumeValue(this.#value)
        }
    }


    #handleInput () {
        const newValue = parseFloat(this.#slider.value)
        if (this.#value !== newValue) {
            this.#value = newValue
            this.#valueEl.textContent = formatVolumeValue(this.#value)
            emitChange(this, {value: this.#value})
        }
    }

}


customElements.define('volume-input', VolumeInput)
