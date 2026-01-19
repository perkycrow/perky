

import {adoptStyles, createSheet} from '../styles/index.js'


const tabBarCSS = createSheet(`
    :host {
        display: inline-flex;
        background: var(--bg-tertiary);
        border-radius: var(--radius-md);
        padding: 2px;
        gap: 2px;
        font-family: var(--font-mono);
    }

    .tab {
        appearance: none;
        background: transparent;
        border: none;
        color: var(--fg-muted);
        font-size: var(--font-size-sm);
        font-family: inherit;
        padding: var(--spacing-xs) var(--spacing-sm);
        border-radius: var(--radius-sm);
        cursor: pointer;
        transition: background var(--transition-fast), color var(--transition-fast);
        white-space: nowrap;
    }

    .tab:hover {
        color: var(--fg-secondary);
    }

    .tab.active {
        background: var(--bg-primary);
        color: var(--fg-primary);
        box-shadow: var(--shadow-sm);
    }


    ::slotted(button) {
        appearance: none;
        background: transparent;
        border: none;
        color: var(--fg-muted);
        font-size: var(--font-size-sm);
        font-family: var(--font-mono);
        padding: var(--spacing-xs) var(--spacing-sm);
        border-radius: var(--radius-sm);
        cursor: pointer;
        transition: background var(--transition-fast), color var(--transition-fast);
        white-space: nowrap;
    }

    ::slotted(button:hover) {
        color: var(--fg-secondary);
    }

    ::slotted(button[aria-selected="true"]) {
        background: var(--bg-primary);
        color: var(--fg-primary);
        box-shadow: var(--shadow-sm);
    }


    :host([context="studio"]) {
        padding: 4px;
        gap: 4px;
        border-radius: var(--radius-lg);
    }

    :host([context="studio"]) .tab {
        font-size: var(--font-size-md);
        padding: var(--spacing-sm) var(--spacing-md);
        min-height: var(--touch-target);
        border-radius: var(--radius-md);
    }

    :host([context="studio"]) ::slotted(button) {
        font-size: var(--font-size-md);
        padding: var(--spacing-sm) var(--spacing-md);
        min-height: var(--touch-target);
        border-radius: var(--radius-md);
    }
`)


export default class TabBar extends HTMLElement {

    #container = null
    #value = null
    #tabs = []

    constructor () {
        super()
        this.attachShadow({mode: 'open'})
        adoptStyles(this.shadowRoot, tabBarCSS)
        this.#buildDOM()
    }


    connectedCallback () {
        this.#setupSlottedTabs()
    }


    static get observedAttributes () {
        return ['value']
    }


    attributeChangedCallback (name, oldValue, newValue) {
        if (name === 'value' && newValue !== oldValue) {
            this.#value = newValue
            this.#updateActiveState()
        }
    }


    get value () {
        return this.#value
    }


    set value (val) {
        if (this.#value !== val) {
            this.#value = val
            this.setAttribute('value', val)
            this.#updateActiveState()
        }
    }


    setTabs (tabs) {
        this.#tabs = tabs
        this.#renderTabs()
    }


    #buildDOM () {
        this.#container = document.createElement('div')
        this.#container.style.cssText = 'display:contents;'

        const slot = document.createElement('slot')
        slot.name = 'tab'
        slot.addEventListener('slotchange', () => this.#setupSlottedTabs())

        this.shadowRoot.appendChild(this.#container)
        this.shadowRoot.appendChild(slot)
    }


    #renderTabs () {
        this.#container.innerHTML = ''

        for (const tab of this.#tabs) {
            const btn = document.createElement('button')
            btn.className = 'tab'
            btn.textContent = tab.label
            btn.dataset.value = tab.value

            if (tab.value === this.#value) {
                btn.classList.add('active')
            }

            btn.addEventListener('click', () => this.#selectTab(tab.value))
            this.#container.appendChild(btn)
        }
    }


    #setupSlottedTabs () {
        const slot = this.shadowRoot.querySelector('slot[name="tab"]')
        const slottedButtons = slot.assignedElements()

        for (const btn of slottedButtons) {
            btn.setAttribute('aria-selected', btn.dataset.value === this.#value ? 'true' : 'false')

            if (!btn.dataset.tabListenerAttached) {
                btn.addEventListener('click', () => this.#selectTab(btn.dataset.value))
                btn.dataset.tabListenerAttached = 'true'
            }
        }
    }


    #selectTab (value) {
        if (this.#value === value) {
            return
        }

        this.#value = value
        this.setAttribute('value', value)
        this.#updateActiveState()

        this.dispatchEvent(new CustomEvent('change', {
            bubbles: true,
            detail: {value}
        }))
    }


    #updateActiveState () {

        const buttons = this.#container.querySelectorAll('.tab')
        for (const btn of buttons) {
            btn.classList.toggle('active', btn.dataset.value === this.#value)
        }


        const slot = this.shadowRoot.querySelector('slot[name="tab"]')
        const slottedButtons = slot.assignedElements()
        for (const btn of slottedButtons) {
            btn.setAttribute('aria-selected', btn.dataset.value === this.#value ? 'true' : 'false')
        }
    }

}


customElements.define('tab-bar', TabBar)
