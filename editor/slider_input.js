import EditorComponent from './editor_component.js'
import {controlsSheet} from './styles/index.js'
import {emitChange, handleAttributeChange} from './base_input.js'
import {createElement} from '../application/dom_utils.js'


const sliderInputCSS = `
    .slider-input-container {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
    }

    .slider-input-label {
        font-size: var(--font-size-xs);
        color: var(--fg-muted);
        min-width: 60px;
    }

    .slider-input-label:empty {
        display: none;
        min-width: 0;
    }

    :host([no-label]) .slider-input-label {
        display: none !important;
        min-width: 0;
    }

    .slider-input-track {
        flex: 1;
        height: 4px;
        -webkit-appearance: none;
        appearance: none;
        background: transparent;
        cursor: pointer;
    }

    .slider-input-track::-webkit-slider-runnable-track {
        height: 4px;
        background: var(--bg-hover);
        border-radius: 2px;
    }

    .slider-input-track::-moz-range-track {
        height: 4px;
        background: var(--bg-hover);
        border-radius: 2px;
        border: none;
    }

    .slider-input-track::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 12px;
        height: 12px;
        background: var(--accent);
        border-radius: 50%;
        cursor: pointer;
        margin-top: -4px;
        transition: transform var(--transition-fast), box-shadow var(--transition-fast);
    }

    .slider-input-track::-webkit-slider-thumb:hover {
        transform: scale(1.2);
        box-shadow: 0 0 6px var(--accent);
    }

    .slider-input-track::-moz-range-thumb {
        width: 12px;
        height: 12px;
        background: var(--accent);
        border: none;
        border-radius: 50%;
        cursor: pointer;
    }

    .slider-input-value {
        font-size: var(--font-size-xs);
        color: var(--fg-secondary);
        min-width: 32px;
        text-align: right;
        font-variant-numeric: tabular-nums;
    }

    :host([no-value]) .slider-input-value {
        display: none;
    }


    :host([context="studio"]) .slider-input-container {
        gap: var(--spacing-md);
    }

    :host([context="studio"]) .slider-input-label {
        font-size: var(--font-size-md);
        min-width: 80px;
    }

    :host([context="studio"]) .slider-input-track {
        height: 8px;
    }

    :host([context="studio"]) .slider-input-track::-webkit-slider-runnable-track {
        height: 8px;
        border-radius: 4px;
    }

    :host([context="studio"]) .slider-input-track::-webkit-slider-thumb {
        width: 24px;
        height: 24px;
        margin-top: -8px;
    }

    :host([context="studio"]) .slider-input-track::-moz-range-track {
        height: 8px;
        border-radius: 4px;
    }

    :host([context="studio"]) .slider-input-track::-moz-range-thumb {
        width: 24px;
        height: 24px;
    }

    :host([context="studio"]) .slider-input-value {
        font-size: var(--font-size-md);
        min-width: 48px;
    }
`


export default class SliderInput extends EditorComponent {

    static styles = [controlsSheet, sliderInputCSS]

    #value = 0
    #min = 0
    #max = 100
    #step = 1
    #label = ''

    #slider = null
    #labelEl = null
    #valueEl = null

    static get observedAttributes () {
        return ['value', 'min', 'max', 'step', 'label']
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


    get value () {
        return this.#value
    }


    set value (val) {
        const newValue = this.#clamp(parseFloat(val) || 0)
        if (this.#value !== newValue) {
            this.#value = newValue
            this.#updateDisplay()
        }
    }


    setValue (val) {
        this.#value = val
        this.#updateDisplay()
    }


    setMin (val) {
        this.#min = val
        if (this.#slider) {
            this.#slider.min = this.#min
        }
    }


    setMax (val) {
        this.#max = val
        if (this.#slider) {
            this.#slider.max = this.#max
        }
    }


    setStep (val) {
        this.#step = val
        if (this.#slider) {
            this.#slider.step = this.#step
        }
    }


    setLabel (val) {
        this.#label = val
        if (this.#labelEl) {
            this.#labelEl.textContent = this.#label
        }
    }


    #buildDOM () {
        const container = createElement('div', {class: 'slider-input-container'})

        this.#labelEl = createElement('span', {
            class: 'slider-input-label',
            text: this.#label
        })

        this.#slider = createElement('input', {
            type: 'range',
            class: 'slider-input-track',
            min: this.#min,
            max: this.#max,
            step: this.#step
        })
        this.#slider.addEventListener('input', () => this.#handleInput())

        this.#valueEl = createElement('span', {class: 'slider-input-value'})

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
            this.#valueEl.textContent = formatSliderValue(this.#value)
        }
    }


    #handleInput () {
        const newValue = parseFloat(this.#slider.value)
        if (this.#value !== newValue) {
            this.#value = newValue
            this.#valueEl.textContent = formatSliderValue(this.#value)
            emitChange(this, {value: this.#value})
        }
    }


    #clamp (value) {
        return Math.max(this.#min, Math.min(this.#max, value))
    }

}


function formatSliderValue (value) {
    if (Math.abs(value) < 0.01) {
        return value.toFixed(3)
    }
    return value.toFixed(2)
}


customElements.define('slider-input', SliderInput)
