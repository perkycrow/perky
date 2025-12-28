import {cssVariables} from './perky_explorer_styles.js'


const SHIFT_MULTIPLIER = 10
const CTRL_MULTIPLIER = 0.1
const DRAG_SENSITIVITY = 0.5


export default class NumberInput extends HTMLElement {

    #value = 0
    #step = 0.1
    #precision = 2
    #label = ''
    #min = -Infinity
    #max = Infinity

    #input = null
    #labelEl = null
    #decrementBtn = null
    #incrementBtn = null

    #isDragging = false
    #dragStartX = 0
    #dragStartValue = 0

    // Arrow function properties for event handlers (auto-bound)
    #onDragMove = (event) => {
        if (!this.#isDragging) {
            return
        }

        const deltaX = event.clientX - this.#dragStartX
        const multiplier = this.#getMultiplier(event)
        const delta = deltaX * DRAG_SENSITIVITY * this.#step * multiplier
        const newValue = this.#clamp(this.#dragStartValue + delta)

        if (this.#value !== newValue) {
            this.#value = newValue
            this.#updateDisplay()
            this.#emitChange()
        }
    }

    #onDragEnd = () => {
        this.#isDragging = false
        this.#labelEl.classList.remove('dragging')
        document.body.style.cursor = ''
        document.removeEventListener('mousemove', this.#onDragMove)
        document.removeEventListener('mouseup', this.#onDragEnd)
    }


    static get observedAttributes () {
        return ['value', 'step', 'precision', 'label', 'min', 'max']
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
        case 'step':
            this.#step = parseFloat(newValue) || 0.1
            break
        case 'precision':
            this.#precision = parseInt(newValue, 10) || 2
            this.#updateDisplay()
            break
        case 'label':
            this.#label = newValue || ''
            if (this.#labelEl) {
                this.#labelEl.textContent = this.#label
            }
            break
        case 'min':
            this.#min = newValue === null ? -Infinity : parseFloat(newValue)
            break
        case 'max':
            this.#max = newValue === null ? Infinity : parseFloat(newValue)
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
        container.className = 'number-input-container'

        // Label with drag functionality
        this.#labelEl = document.createElement('span')
        this.#labelEl.className = 'number-input-label'
        this.#labelEl.textContent = this.#label
        this.#labelEl.addEventListener('mousedown', (e) => this.#startDrag(e))

        // Input field
        this.#input = document.createElement('input')
        this.#input.className = 'number-input-field'
        this.#input.type = 'text'
        this.#input.inputMode = 'decimal'
        this.#input.addEventListener('input', () => this.#handleInputChange())
        this.#input.addEventListener('keydown', (e) => this.#handleKeyDown(e))
        this.#input.addEventListener('blur', () => this.#handleBlur())
        this.#input.addEventListener('focus', () => this.#input.select())

        // Stepper buttons
        const stepperContainer = document.createElement('div')
        stepperContainer.className = 'number-input-steppers'

        this.#decrementBtn = document.createElement('button')
        this.#decrementBtn.className = 'number-input-stepper'
        this.#decrementBtn.innerHTML = '◀'
        this.#decrementBtn.tabIndex = -1
        this.#decrementBtn.addEventListener('click', (e) => this.#handleStep(-1, e))

        this.#incrementBtn = document.createElement('button')
        this.#incrementBtn.className = 'number-input-stepper'
        this.#incrementBtn.innerHTML = '▶'
        this.#incrementBtn.tabIndex = -1
        this.#incrementBtn.addEventListener('click', (e) => this.#handleStep(1, e))

        stepperContainer.appendChild(this.#decrementBtn)
        stepperContainer.appendChild(this.#incrementBtn)

        container.appendChild(this.#labelEl)
        container.appendChild(this.#input)
        container.appendChild(stepperContainer)

        this.shadowRoot.appendChild(container)
    }


    #getStyles () {
        return `
            :host {
                ${cssVariables}
                display: inline-flex;
                flex: 1;
                min-width: 0;
                font-family: var(--font-mono);
            }

            .number-input-container {
                display: flex;
                align-items: center;
                gap: 6px;
                flex: 1;
                min-width: 0;
                background: var(--bg-primary);
                border: 1px solid var(--border);
                border-radius: 4px;
                padding: 0 2px 0 8px;
                height: 26px;
                transition: border-color 0.15s;
            }

            .number-input-container:focus-within {
                border-color: var(--accent);
            }

            .number-input-label {
                font-size: 11px;
                color: var(--fg-muted);
                cursor: ew-resize;
                user-select: none;
                min-width: 10px;
                text-transform: lowercase;
            }

            .number-input-label:hover {
                color: var(--accent);
            }

            .number-input-label.dragging {
                color: var(--accent);
            }

            .number-input-field {
                flex: 1;
                background: transparent;
                border: none;
                color: var(--fg-primary);
                font-size: 11px;
                font-family: var(--font-mono);
                min-width: 0;
                text-align: right;
                padding: 0;
            }

            .number-input-field:focus {
                outline: none;
            }

            .number-input-steppers {
                display: flex;
                gap: 1px;
            }

            .number-input-stepper {
                background: var(--bg-hover);
                border: none;
                color: var(--fg-muted);
                cursor: pointer;
                font-size: 7px;
                width: 14px;
                height: 18px;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: background 0.1s, color 0.1s;
            }

            .number-input-stepper:first-child {
                border-radius: 2px 0 0 2px;
            }

            .number-input-stepper:last-child {
                border-radius: 0 2px 2px 0;
            }

            .number-input-stepper:hover {
                background: var(--bg-selected);
                color: var(--fg-primary);
            }

            .number-input-stepper:active {
                background: var(--accent);
                color: var(--bg-primary);
            }
        `
    }


    #updateDisplay () {
        if (this.#input && !this.#input.matches(':focus')) {
            this.#input.value = this.#value.toFixed(this.#precision)
        }
    }


    #handleInputChange () {
        const parsed = parseFloat(this.#input.value)
        if (!isNaN(parsed)) {
            const clamped = this.#clamp(parsed)
            if (this.#value !== clamped) {
                this.#value = clamped
                this.#emitChange()
            }
        }
    }


    #handleBlur () {
        const parsed = parseFloat(this.#input.value)
        if (isNaN(parsed)) {
            this.#updateDisplay()
        } else {
            this.#value = this.#clamp(parsed)
            this.#updateDisplay()
        }
    }


    #handleKeyDown (event) {
        const multiplier = this.#getMultiplier(event)

        switch (event.key) {
        case 'ArrowUp':
            event.preventDefault()
            this.#adjustValue(this.#step * multiplier)
            break
        case 'ArrowDown':
            event.preventDefault()
            this.#adjustValue(-this.#step * multiplier)
            break
        case 'Enter':
            event.preventDefault()
            this.#input.blur()
            break
        case 'Escape':
            event.preventDefault()
            this.#updateDisplay()
            this.#input.blur()
            break
        }
    }


    #handleStep (direction, event) {
        const multiplier = this.#getMultiplier(event)
        this.#adjustValue(direction * this.#step * multiplier)
    }


    #adjustValue (delta) {
        const newValue = this.#clamp(this.#value + delta)
        if (this.#value !== newValue) {
            this.#value = newValue
            this.#updateDisplay()
            this.#emitChange()
        }
    }


    #getMultiplier (event) {
        if (event.shiftKey) {
            return SHIFT_MULTIPLIER
        }
        if (event.ctrlKey || event.metaKey) {
            return CTRL_MULTIPLIER
        }
        return 1
    }


    #clamp (value) {
        return Math.max(this.#min, Math.min(this.#max, value))
    }


    #startDrag (event) {
        event.preventDefault()
        this.#isDragging = true
        this.#dragStartX = event.clientX
        this.#dragStartValue = this.#value
        this.#labelEl.classList.add('dragging')
        document.body.style.cursor = 'ew-resize'
        document.addEventListener('mousemove', this.#onDragMove)
        document.addEventListener('mouseup', this.#onDragEnd)
    }


    #emitChange () {
        this.dispatchEvent(new CustomEvent('change', {
            detail: {value: this.#value},
            bubbles: true
        }))
    }

}


customElements.define('number-input', NumberInput)
