import EditorComponent from './editor_component.js'
import {controlsSheet} from './styles/index.js'
import {emitChange} from './base_input.js'


const selectInputCSS = `
    :host {
        display: inline-block;
        position: relative;
    }

    .select-button {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--spacing-sm);
        background: transparent;
        border: none;
        padding: 0 var(--spacing-sm) 0 var(--spacing-md);
        height: var(--input-height);
        min-width: 100px;
        font-family: var(--font-mono);
        font-size: var(--font-size-sm);
        color: var(--fg-primary);
        cursor: pointer;
        transition: background var(--transition-fast);
        -webkit-tap-highlight-color: transparent;
        user-select: none;
        -webkit-user-select: none;
        border-radius: 0;
    }

    .select-button:hover {
        background: var(--bg-hover);
    }

    .select-button:focus {
        outline: none;
    }

    .select-button.open {
        background: var(--bg-hover);
    }

    .select-label {
        flex: 1;
        text-align: left;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .select-chevron {
        font-size: 10px;
        color: var(--fg-muted);
        transition: transform var(--transition-fast);
    }

    .select-button.open .select-chevron {
        transform: rotate(180deg);
    }

    .select-dropdown {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        margin-top: 4px;
        background: var(--bg-secondary);
        border: none;
        border-radius: var(--radius-md);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
        z-index: 1000;
        max-height: 240px;
        overflow-y: auto;
        display: none;
    }

    .select-dropdown.open {
        display: block;
    }

    .select-dropdown.above {
        top: auto;
        bottom: 100%;
        margin-top: 0;
        margin-bottom: 4px;
    }

    .select-option {
        display: flex;
        align-items: center;
        padding: var(--spacing-sm) var(--spacing-md);
        color: var(--fg-primary);
        cursor: pointer;
        transition: background var(--transition-fast);
        -webkit-tap-highlight-color: transparent;
    }

    .select-option:first-child {
        border-radius: var(--radius-md) var(--radius-md) 0 0;
    }

    .select-option:last-child {
        border-radius: 0 0 var(--radius-md) var(--radius-md);
    }

    .select-option:hover,
    .select-option.focused {
        background: var(--bg-hover);
    }

    .select-option.selected {
        background: var(--accent);
        color: var(--bg-primary);
    }

    .select-option.selected.focused {
        background: var(--accent-hover, var(--accent));
    }


    :host([context="studio"]) .select-button {
        height: var(--touch-target);
        padding: 0 var(--spacing-md) 0 var(--spacing-lg);
        border-radius: var(--radius-md);
        font-size: var(--font-size-md);
        min-width: 120px;
    }

    :host([context="studio"]) .select-option {
        padding: var(--spacing-md) var(--spacing-lg);
        font-size: var(--font-size-md);
        min-height: var(--touch-target);
    }

    :host([context="studio"]) .select-chevron {
        font-size: 12px;
    }
`


export default class SelectInput extends EditorComponent {

    static styles = [controlsSheet, selectInputCSS]

    #value = null
    #options = []
    #focusedIndex = -1
    #isOpen = false

    #buttonEl = null
    #labelEl = null
    #chevronEl = null
    #dropdownEl = null

    #handleOutsideClick = (e) => {
        const path = e.composedPath()
        if (!path.includes(this)) {
            this.#close()
        }
    }

    #handleKeyDown = (e) => {
        if (!this.#isOpen) {
            if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
                e.preventDefault()
                this.#open()
            }
            return
        }

        this.#handleOpenKeyDown(e)
    }

    #handleOpenKeyDown (e) {
        const keyHandlers = {
            Escape: () => {
                e.preventDefault()
                this.#close()
            },
            ArrowDown: () => {
                e.preventDefault()
                this.#moveFocus(1)
            },
            ArrowUp: () => {
                e.preventDefault()
                this.#moveFocus(-1)
            },
            Enter: () => {
                e.preventDefault()
                if (this.#focusedIndex >= 0) {
                    this.#selectIndex(this.#focusedIndex)
                }
            },
            ' ': () => {
                e.preventDefault()
                if (this.#focusedIndex >= 0) {
                    this.#selectIndex(this.#focusedIndex)
                }
            },
            Tab: () => this.#close()
        }

        keyHandlers[e.key]?.()
    }


    constructor () {
        super()
        this.#buildDOM()
    }


    onConnected () {
        this.#updateDisplay()
    }


    onDisconnected () {
        this.#close()
    }


    get value () {
        return this.#value
    }


    set value (val) {
        if (this.#value !== val) {
            this.#value = val
            this.#updateDisplay()
        }
    }


    setValue (val) {
        this.#value = val
        this.#updateDisplay()
    }


    setOptions (options) {
        this.#options = options.map(opt => {
            if (typeof opt === 'string') {
                return {value: opt, label: opt}
            }
            return opt
        })
        this.#renderOptions()
        this.#updateDisplay()
    }


    #buildDOM () {
        this.#buttonEl = document.createElement('button')
        this.#buttonEl.className = 'select-button'
        this.#buttonEl.type = 'button'
        this.#buttonEl.addEventListener('click', () => this.#toggle())
        this.#buttonEl.addEventListener('keydown', this.#handleKeyDown)

        this.#labelEl = document.createElement('span')
        this.#labelEl.className = 'select-label'

        this.#chevronEl = document.createElement('span')
        this.#chevronEl.className = 'select-chevron'
        this.#chevronEl.textContent = '▼'

        this.#buttonEl.appendChild(this.#labelEl)
        this.#buttonEl.appendChild(this.#chevronEl)

        this.#dropdownEl = document.createElement('div')
        this.#dropdownEl.className = 'select-dropdown'

        this.shadowRoot.appendChild(this.#buttonEl)
        this.shadowRoot.appendChild(this.#dropdownEl)
    }


    #renderOptions () {
        this.#dropdownEl.innerHTML = ''

        for (let i = 0; i < this.#options.length; i++) {
            const opt = this.#options[i]
            const optionEl = document.createElement('div')
            optionEl.className = 'select-option'
            optionEl.textContent = opt.label
            optionEl.dataset.index = i

            if (opt.value === this.#value) {
                optionEl.classList.add('selected')
            }

            optionEl.addEventListener('click', (e) => {
                e.stopPropagation()
                this.#selectIndex(i)
            })

            this.#dropdownEl.appendChild(optionEl)
        }
    }


    #updateDisplay () {
        const selected = this.#options.find(opt => opt.value === this.#value)
        this.#labelEl.textContent = selected ? selected.label : ''

        const optionEls = this.#dropdownEl.querySelectorAll('.select-option')
        optionEls.forEach((el, i) => {
            el.classList.toggle('selected', this.#options[i]?.value === this.#value)
        })
    }


    #toggle () {
        if (this.#isOpen) {
            this.#close()
        } else {
            this.#open()
        }
    }


    #open () {
        if (this.#isOpen) {
            return
        }

        this.#isOpen = true
        this.#buttonEl.classList.add('open')
        this.#dropdownEl.classList.add('open')

        this.#positionDropdown()

        const selectedIndex = this.#options.findIndex(opt => opt.value === this.#value)
        this.#focusedIndex = selectedIndex >= 0 ? selectedIndex : 0
        this.#updateFocusedOption()

        requestAnimationFrame(() => {
            document.addEventListener('click', this.#handleOutsideClick)
            document.addEventListener('touchstart', this.#handleOutsideClick)
        })
    }


    #close () {
        if (!this.#isOpen) {
            return
        }

        this.#isOpen = false
        this.#focusedIndex = -1
        this.#buttonEl.classList.remove('open')
        this.#dropdownEl.classList.remove('open', 'above')

        document.removeEventListener('click', this.#handleOutsideClick)
        document.removeEventListener('touchstart', this.#handleOutsideClick)
    }


    #positionDropdown () {
        const buttonRect = this.#buttonEl.getBoundingClientRect()
        const dropdownHeight = Math.min(240, this.#options.length * 40)
        const spaceBelow = window.innerHeight - buttonRect.bottom
        const spaceAbove = buttonRect.top

        if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
            this.#dropdownEl.classList.add('above')
        } else {
            this.#dropdownEl.classList.remove('above')
        }
    }


    #selectIndex (index) {
        const opt = this.#options[index]
        if (!opt) {
            return
        }

        const oldValue = this.#value
        this.#value = opt.value
        this.#updateDisplay()
        this.#close()
        this.#buttonEl.focus()

        if (oldValue !== this.#value) {
            emitChange(this, {value: this.#value})
        }
    }


    #moveFocus (direction) {
        const newIndex = this.#focusedIndex + direction
        if (newIndex >= 0 && newIndex < this.#options.length) {
            this.#focusedIndex = newIndex
            this.#updateFocusedOption()
            this.#scrollToFocused()
        }
    }


    #updateFocusedOption () {
        const optionEls = this.#dropdownEl.querySelectorAll('.select-option')
        optionEls.forEach((el, i) => {
            el.classList.toggle('focused', i === this.#focusedIndex)
        })
    }


    #scrollToFocused () {
        const optionEls = this.#dropdownEl.querySelectorAll('.select-option')
        const focusedEl = optionEls[this.#focusedIndex]
        if (focusedEl) {
            focusedEl.scrollIntoView({block: 'nearest'})
        }
    }

}


customElements.define('select-input', SelectInput)
