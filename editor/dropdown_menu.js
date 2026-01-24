

import {adoptStyles, createSheet} from './styles/index.js'


const dropdownStyles = createSheet(`
    :host {
        position: relative;
        display: inline-block;
    }

    .trigger {
        appearance: none;
        background: var(--bg-tertiary);
        color: var(--fg-secondary);
        border: none;
        border-radius: var(--radius-md);
        padding: 10px;
        font-family: inherit;
        font-size: 16px;
        cursor: pointer;
        transition: background var(--transition-fast), color var(--transition-fast);
        min-height: var(--touch-target);
        min-width: var(--touch-target);
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .trigger:hover {
        background: var(--bg-hover);
        color: var(--fg-primary);
    }

    .trigger:active {
        transform: scale(0.96);
    }

    .trigger svg {
        width: 18px;
        height: 18px;
        stroke: currentColor;
        fill: none;
        stroke-width: 2;
        stroke-linecap: round;
        stroke-linejoin: round;
    }

    .menu {
        position: absolute;
        top: 100%;
        left: 0;
        margin-top: var(--spacing-xs);
        background: var(--bg-secondary);
        border: 1px solid var(--border);
        border-radius: var(--radius-md);
        box-shadow: var(--shadow-lg);
        min-width: 160px;
        padding: var(--spacing-xs);
        z-index: 1000;
        opacity: 0;
        transform: translateY(-8px);
        pointer-events: none;
        transition: opacity 0.15s, transform 0.15s;
    }

    :host([open]) .menu {
        opacity: 1;
        transform: translateY(0);
        pointer-events: auto;
    }

    .menu-item {
        appearance: none;
        background: transparent;
        border: none;
        color: var(--fg-primary);
        font-family: inherit;
        font-size: var(--font-size-sm);
        padding: var(--spacing-sm) var(--spacing-md);
        width: 100%;
        text-align: left;
        cursor: pointer;
        border-radius: var(--radius-sm);
        transition: background var(--transition-fast);
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
    }

    .menu-item:hover {
        background: var(--bg-hover);
    }

    .menu-item:active {
        background: var(--bg-selected);
    }
`)


export default class DropdownMenu extends HTMLElement {

    #triggerEl = null
    #menuEl = null
    #items = []

    constructor () {
        super()
        this.attachShadow({mode: 'open'})
        adoptStyles(this.shadowRoot, dropdownStyles)
        this.#buildDOM()
    }


    connectedCallback () {
        document.addEventListener('click', this.#handleOutsideClick)
    }


    disconnectedCallback () {
        document.removeEventListener('click', this.#handleOutsideClick)
    }


    #handleOutsideClick = (e) => {
        if (!this.contains(e.target)) {
            this.close()
        }
    }


    setIcon (icon) {
        this.#triggerEl.innerHTML = icon
    }


    setItems (items) {
        this.#items = items
        this.#renderItems()
    }


    open () {
        this.setAttribute('open', '')
    }


    close () {
        this.removeAttribute('open')
    }


    toggle () {
        if (this.hasAttribute('open')) {
            this.close()
        } else {
            this.open()
        }
    }


    #buildDOM () {
        this.#triggerEl = document.createElement('button')
        this.#triggerEl.className = 'trigger'
        this.#triggerEl.addEventListener('click', (e) => {
            e.stopPropagation()
            this.toggle()
        })

        this.#menuEl = document.createElement('div')
        this.#menuEl.className = 'menu'

        this.shadowRoot.appendChild(this.#triggerEl)
        this.shadowRoot.appendChild(this.#menuEl)
    }


    #renderItems () {
        this.#menuEl.innerHTML = ''

        for (const item of this.#items) {
            const btn = document.createElement('button')
            btn.className = 'menu-item'
            btn.textContent = item.label
            btn.addEventListener('click', () => {
                this.close()
                this.dispatchEvent(new CustomEvent('select', {
                    detail: {value: item.value || item.label}
                }))
                if (item.action) {
                    item.action()
                }
            })
            this.#menuEl.appendChild(btn)
        }
    }

}


customElements.define('dropdown-menu', DropdownMenu)
