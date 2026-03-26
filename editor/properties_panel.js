import EditorComponent from './editor_component.js'
import {createElement} from '../application/dom_utils.js'


export default class PropertiesPanel extends EditorComponent {

    static styles = `
        :host {
            display: block;
            padding: var(--spacing-lg);
        }

        .panel-title {
            font-size: 11px;
            font-weight: 600;
            color: var(--fg-muted);
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: var(--spacing-lg);
        }

        .prop-row {
            display: flex;
            align-items: center;
            margin-bottom: var(--spacing-md);
            gap: var(--spacing-sm);
        }

        .prop-label {
            font-size: var(--font-size-sm);
            color: var(--fg-muted);
            min-width: 40px;
        }

        .prop-input {
            flex: 1;
            background: var(--bg-primary);
            border: 1px solid var(--border);
            border-radius: var(--radius-sm);
            color: var(--fg-primary);
            font-size: var(--font-size-sm);
            font-family: var(--font-mono);
            padding: 4px 6px;
            width: 100%;
        }

        .prop-input:focus {
            outline: none;
            border-color: var(--accent);
        }

        .panel-separator {
            border-top: 1px solid var(--border);
            margin: var(--spacing-lg) 0;
        }

        .panel-btn {
            width: 100%;
            margin-top: var(--spacing-md);
            padding: 6px;
            background: transparent;
            border: 1px solid var(--border);
            border-radius: var(--radius-sm);
            color: var(--fg-primary);
            font-size: var(--font-size-sm);
            font-family: var(--font-mono);
            cursor: pointer;
        }

        .panel-btn:hover {
            background: var(--bg-hover);
        }

        .panel-btn.danger {
            border-color: #f66;
            color: #f66;
        }

        .panel-btn.danger:hover {
            background: rgba(255, 102, 102, 0.1);
        }

        .empty-message {
            color: var(--fg-muted);
            font-size: var(--font-size-sm);
            text-align: center;
            padding: var(--spacing-xl);
        }
    `

    #contentEl = null

    constructor () {
        super()
        this.#contentEl = createElement('div')
        this.shadowRoot.appendChild(this.#contentEl)
    }


    clear () {
        if (this.#contentEl) {
            this.#contentEl.innerHTML = ''
        }
    }


    addTitle (text) {
        this.#contentEl.appendChild(createElement('div', {class: 'panel-title', text}))
    }


    addNumber (label, value, onChange, options = {}) {
        const row = createElement('div', {class: 'prop-row'})
        row.appendChild(createElement('span', {class: 'prop-label', text: label}))

        const input = createElement('input', {
            class: 'prop-input',
            attrs: {
                type: 'number',
                step: String(options.step ?? 0.5),
                value: String(value)
            }
        })

        input.addEventListener('change', () => {
            onChange(parseFloat(input.value) || 0)
        })

        row.appendChild(input)
        this.#contentEl.appendChild(row)
    }


    addText (label, value, onChange) {
        const row = createElement('div', {class: 'prop-row'})
        row.appendChild(createElement('span', {class: 'prop-label', text: label}))

        const input = createElement('input', {
            class: 'prop-input',
            attrs: {type: 'text', value: value || ''}
        })

        input.addEventListener('change', () => {
            onChange(input.value)
        })

        row.appendChild(input)
        this.#contentEl.appendChild(row)
    }


    addButton (label, onClick, variant = '') {
        const classes = ['panel-btn', variant].filter(Boolean).join(' ')
        const btn = createElement('button', {class: classes, text: label})
        btn.addEventListener('click', onClick)
        this.#contentEl.appendChild(btn)
    }


    addSeparator () {
        this.#contentEl.appendChild(createElement('div', {class: 'panel-separator'}))
    }


    addMessage (text) {
        this.#contentEl.appendChild(createElement('div', {class: 'empty-message', text}))
    }

}


customElements.define('properties-panel', PropertiesPanel)
