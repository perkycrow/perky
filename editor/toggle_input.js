import {cssVariables} from './perky_explorer_styles.js'


export default class ToggleInput extends HTMLElement {

    #checked = false
    #label = ''

    #toggle = null
    #labelEl = null


    static get observedAttributes () {
        return ['checked', 'label']
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
        case 'checked':
            this.#checked = newValue !== null
            this.#updateDisplay()
            break
        case 'label':
            this.#label = newValue || ''
            if (this.#labelEl) {
                this.#labelEl.textContent = this.#label
            }
            break
        }
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


    #buildDOM () {
        const style = document.createElement('style')
        style.textContent = this.#getStyles()
        this.shadowRoot.appendChild(style)

        const container = document.createElement('div')
        container.className = 'toggle-input-container'

        // Toggle switch
        this.#toggle = document.createElement('div')
        this.#toggle.className = 'toggle-input-track'
        this.#toggle.addEventListener('click', () => this.#handleClick())

        const thumb = document.createElement('div')
        thumb.className = 'toggle-input-thumb'
        this.#toggle.appendChild(thumb)

        // Label
        this.#labelEl = document.createElement('span')
        this.#labelEl.className = 'toggle-input-label'
        this.#labelEl.textContent = this.#label
        this.#labelEl.addEventListener('click', () => this.#handleClick())

        container.appendChild(this.#toggle)
        container.appendChild(this.#labelEl)

        this.shadowRoot.appendChild(container)
    }


    #getStyles () {
        return `
            :host {
                ${cssVariables}
                display: inline-flex;
                font-family: var(--font-mono);
            }

            .toggle-input-container {
                display: flex;
                align-items: center;
                gap: 8px;
                cursor: pointer;
            }

            .toggle-input-track {
                position: relative;
                width: 28px;
                height: 14px;
                background: var(--bg-hover);
                border-radius: 7px;
                transition: background 0.2s;
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
                transition: transform 0.2s, background 0.2s;
            }

            .toggle-input-track.checked .toggle-input-thumb {
                transform: translateX(14px);
                background: var(--bg-primary);
            }

            .toggle-input-label {
                font-size: 11px;
                color: var(--fg-primary);
                font-weight: 500;
                user-select: none;
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
        `
    }


    #updateDisplay () {
        if (this.#toggle) {
            this.#toggle.classList.toggle('checked', this.#checked)
        }
    }


    #handleClick () {
        this.#checked = !this.#checked
        this.#updateDisplay()
        this.#emitChange()
    }


    #emitChange () {
        this.dispatchEvent(new CustomEvent('change', {
            detail: {checked: this.#checked},
            bubbles: true
        }))
    }

}


customElements.define('toggle-input', ToggleInput)
