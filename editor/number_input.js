import {setupInputStyles, emitChange, handleAttributeChange} from './base_input.js'


const SHIFT_MULTIPLIER = 10
const CTRL_MULTIPLIER = 0.1
const DRAG_SENSITIVITY = 0.5


const numberInputCSS = `
    .number-input-container {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        flex: 1;
        min-width: 0;
        background: var(--bg-primary);
        border: 1px solid var(--border);
        border-radius: var(--radius-sm);
        padding: 0 2px 0 var(--spacing-sm);
        height: var(--input-height);
        transition: border-color var(--transition-fast);
    }

    .number-input-container:focus-within {
        border-color: var(--accent);
    }

    .number-input-label {
        font-size: var(--font-size-sm);
        color: var(--fg-muted);
        cursor: ew-resize;
        user-select: none;
        -webkit-user-select: none;
        min-width: 10px;
        text-transform: lowercase;
        touch-action: none;
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
        font-size: var(--font-size-sm);
        font-family: var(--font-mono);
        min-width: 0;
        text-align: right;
        padding: 0;
        height: auto;
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
        min-height: auto;
        min-width: auto;
        padding: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background var(--transition-fast), color var(--transition-fast);
        border-radius: 0;
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
        transform: none;
    }

    /* Compact mode */
    :host([compact]) .number-input-container {
        background: transparent;
        border: none;
        padding: 0;
        height: auto;
        gap: 2px;
    }

    :host([compact]) .number-input-container:focus-within {
        border-color: transparent;
    }

    :host([compact]) .number-input-label {
        display: none;
    }

    :host([compact]) .number-input-field {
        text-align: center;
        padding: 2px 4px;
        color: var(--fg-muted);
        transition: color var(--transition-fast);
    }

    :host([compact]) .number-input-field:hover {
        color: var(--fg-secondary);
    }

    :host([compact]) .number-input-field:focus {
        color: var(--fg-primary);
    }

    :host([compact]) .number-input-steppers {
        flex-direction: column-reverse;
        gap: 0;
    }

    :host([compact]) .number-input-stepper {
        width: 12px;
        height: 10px;
        font-size: 0;
        border-radius: 2px;
    }

    :host([compact]) .number-input-stepper::after {
        font-size: 6px;
    }

    :host([compact]) .number-input-stepper:first-child {
        border-radius: 0 0 2px 2px;
    }

    :host([compact]) .number-input-stepper:first-child::after {
        content: '▼';
    }

    :host([compact]) .number-input-stepper:last-child {
        border-radius: 2px 2px 0 0;
    }

    :host([compact]) .number-input-stepper:last-child::after {
        content: '▲';
    }

    /* Context: Studio - larger touch targets */
    :host([context="studio"]) .number-input-container {
        height: var(--touch-target);
        padding: 0 var(--spacing-xs) 0 var(--spacing-md);
        border-radius: var(--radius-md);
    }

    :host([context="studio"]) .number-input-label {
        font-size: var(--font-size-md);
    }

    :host([context="studio"]) .number-input-field {
        font-size: var(--font-size-md);
    }

    :host([context="studio"]) .number-input-stepper {
        width: 28px;
        height: 32px;
        font-size: 12px;
    }
`


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

    #onDragMove = (event) => {
        if (!this.#isDragging) {
            return
        }

        const deltaX = event.clientX - this.#dragStartX
        const multiplier = getMultiplier(event)
        const delta = deltaX * DRAG_SENSITIVITY * this.#step * multiplier
        const newValue = this.#clamp(this.#dragStartValue + delta)

        if (this.#value !== newValue) {
            this.#value = newValue
            this.#updateDisplay()
            emitChange(this, {value: this.#value})
        }
    }

    #onDragEnd = () => {
        this.#isDragging = false
        if (this.#labelEl) {
            this.#labelEl.classList.remove('dragging')
        }
        document.body.style.cursor = ''
        document.removeEventListener('pointermove', this.#onDragMove)
        document.removeEventListener('pointerup', this.#onDragEnd)
        document.removeEventListener('pointercancel', this.#onDragEnd)
    }

    static get observedAttributes () {
        return ['value', 'step', 'precision', 'label', 'min', 'max']
    }


    constructor () {
        super()
        this.attachShadow({mode: 'open'})
        setupInputStyles(this.shadowRoot, numberInputCSS)
        this.#buildDOM()
    }


    connectedCallback () {
        this.#updateDisplay()
    }


    disconnectedCallback () {
        if (this.#isDragging) {
            this.#onDragEnd()
        }
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


    setStep (val) {
        this.#step = val
    }


    setPrecision (val) {
        this.#precision = val
        this.#updateDisplay()
    }


    setLabel (val) {
        this.#label = val
        if (this.#labelEl) {
            this.#labelEl.textContent = this.#label
        }
    }


    setMin (val) {
        this.#min = val
    }


    setMax (val) {
        this.#max = val
    }


    setCompact (val) {
        if (val) {
            this.setAttribute('compact', '')
        } else {
            this.removeAttribute('compact')
        }
    }


    #buildDOM () {
        const container = document.createElement('div')
        container.className = 'number-input-container'

        this.#labelEl = document.createElement('span')
        this.#labelEl.className = 'number-input-label'
        this.#labelEl.textContent = this.#label
        this.#labelEl.addEventListener('pointerdown', (e) => this.#startDrag(e))

        this.#input = document.createElement('input')
        this.#input.className = 'number-input-field'
        this.#input.type = 'text'
        this.#input.inputMode = 'decimal'
        this.#input.addEventListener('input', () => this.#handleInputChange())
        this.#input.addEventListener('keydown', (e) => this.#handleKeyDown(e))
        this.#input.addEventListener('blur', () => this.#handleBlur())
        this.#input.addEventListener('focus', () => this.#input.select())

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
                emitChange(this, {value: this.#value})
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
        const multiplier = getMultiplier(event)
        const key = event.key

        if (key === 'ArrowUp') {
            event.preventDefault()
            this.#adjustValue(this.#step * multiplier)
        } else if (key === 'ArrowDown') {
            event.preventDefault()
            this.#adjustValue(-this.#step * multiplier)
        } else if (key === 'Enter') {
            event.preventDefault()
            this.#input.blur()
        } else if (key === 'Escape') {
            event.preventDefault()
            this.#updateDisplay()
            this.#input.blur()
        }
    }


    #handleStep (direction, event) {
        const multiplier = getMultiplier(event)
        this.#adjustValue(direction * this.#step * multiplier)
    }


    #adjustValue (delta) {
        const newValue = this.#clamp(this.#value + delta)
        if (this.#value !== newValue) {
            this.#value = newValue
            this.#updateDisplay()
            emitChange(this, {value: this.#value})
        }
    }


    #clamp (value) {
        return Math.max(this.#min, Math.min(this.#max, value))
    }


    #startDrag (event) {
        event.preventDefault()
        this.#isDragging = true
        this.#dragStartX = event.clientX
        this.#dragStartValue = this.#value
        if (this.#labelEl) {
            this.#labelEl.classList.add('dragging')
        }
        document.body.style.cursor = 'ew-resize'
        document.addEventListener('pointermove', this.#onDragMove)
        document.addEventListener('pointerup', this.#onDragEnd)
        document.addEventListener('pointercancel', this.#onDragEnd)
    }

}


function getMultiplier (event) {
    if (event.shiftKey) {
        return SHIFT_MULTIPLIER
    }
    if (event.ctrlKey || event.metaKey) {
        return CTRL_MULTIPLIER
    }
    return 1
}


customElements.define('number-input', NumberInput)
