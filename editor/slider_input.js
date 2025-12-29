import {cssVariables} from './perky_explorer_styles.js'


export default class SliderInput extends HTMLElement {

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

        switch (name) {
        case 'value':
            this.#value = parseFloat(newValue) || 0
            this.#updateDisplay()
            break
        case 'min':
            this.#min = parseFloat(newValue) || 0
            if (this.#slider) {
                this.#slider.min = this.#min
            }
            break
        case 'max':
            this.#max = parseFloat(newValue) || 100
            if (this.#slider) {
                this.#slider.max = this.#max
            }
            break
        case 'step':
            this.#step = parseFloat(newValue) || 1
            if (this.#slider) {
                this.#slider.step = this.#step
            }
            break
        case 'label':
            this.#label = newValue || ''
            if (this.#labelEl) {
                this.#labelEl.textContent = this.#label
            }
            break
        }
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


    #buildDOM () {
        const style = document.createElement('style')
        style.textContent = this.#getStyles()
        this.shadowRoot.appendChild(style)

        const container = document.createElement('div')
        container.className = 'slider-input-container'

        this.#labelEl = document.createElement('span')
        this.#labelEl.className = 'slider-input-label'
        this.#labelEl.textContent = this.#label

        this.#slider = document.createElement('input')
        this.#slider.type = 'range'
        this.#slider.className = 'slider-input-track'
        this.#slider.min = this.#min
        this.#slider.max = this.#max
        this.#slider.step = this.#step
        this.#slider.addEventListener('input', () => this.#handleInput())

        this.#valueEl = document.createElement('span')
        this.#valueEl.className = 'slider-input-value'

        container.appendChild(this.#labelEl)
        container.appendChild(this.#slider)
        container.appendChild(this.#valueEl)

        this.shadowRoot.appendChild(container)
    }


    #getStyles () {
        return `
            :host {
                ${cssVariables}
                display: block;
                font-family: var(--font-mono);
            }

            .slider-input-container {
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .slider-input-label {
                font-size: 10px;
                color: var(--fg-muted);
                min-width: 60px;
            }

            .slider-input-label:empty {
                display: none;
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
                transition: transform 0.1s, box-shadow 0.1s;
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
                font-size: 10px;
                color: var(--fg-secondary);
                min-width: 32px;
                text-align: right;
                font-variant-numeric: tabular-nums;
            }
        `
    }


    #updateDisplay () {
        if (this.#slider) {
            this.#slider.value = this.#value
        }
        if (this.#valueEl) {
            this.#valueEl.textContent = this.#formatValue(this.#value)
        }
    }


    #handleInput () {
        const newValue = parseFloat(this.#slider.value)
        if (this.#value !== newValue) {
            this.#value = newValue
            this.#valueEl.textContent = this.#formatValue(this.#value)
            this.#emitChange()
        }
    }


    #formatValue (value) {
        if (Math.abs(value) < 0.01) {
            return value.toFixed(3)
        }
        return value.toFixed(2)
    }


    #clamp (value) {
        return Math.max(this.#min, Math.min(this.#max, value))
    }


    #emitChange () {
        this.dispatchEvent(new CustomEvent('change', {
            detail: {value: this.#value},
            bubbles: true
        }))
    }

}


customElements.define('slider-input', SliderInput)
