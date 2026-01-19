/**
 * EditorButton - Standardized button component
 *
 * Usage:
 *   <editor-button>Click me</editor-button>
 *   <editor-button variant="primary">Save</editor-button>
 *   <editor-button variant="danger" icon>🗑</editor-button>
 *
 * Attributes:
 *   - variant: 'default' | 'primary' | 'danger' | 'ghost'
 *   - icon: boolean - icon-only button (square)
 *   - disabled: boolean
 *   - active: boolean - toggle state
 */

import {adoptStyles, controlsSheet, createSheet} from '../styles/index.js'


const componentStyles = createSheet(`
    :host {
        display: inline-block;
    }

    button {
        width: 100%;
    }

    /* Ensure touch target on touch devices */
    @media (pointer: coarse) {
        button {
            min-height: var(--touch-target);
            min-width: var(--touch-target);
        }
    }
`)


export default class EditorButton extends HTMLElement {

    static observedAttributes = ['variant', 'icon', 'disabled', 'active']

    #buttonEl = null

    constructor () {
        super()
        this.attachShadow({mode: 'open'})
        adoptStyles(this.shadowRoot, controlsSheet, componentStyles)
    }


    connectedCallback () {
        this.#render()
    }


    attributeChangedCallback (name, oldValue, newValue) {
        if (oldValue === newValue || !this.#buttonEl) {
            return
        }
        this.#updateButton()
    }


    get variant () {
        return this.getAttribute('variant') || 'default'
    }

    set variant (value) {
        this.setAttribute('variant', value)
    }


    get disabled () {
        return this.hasAttribute('disabled')
    }

    set disabled (value) {
        if (value) {
            this.setAttribute('disabled', '')
        } else {
            this.removeAttribute('disabled')
        }
    }


    get active () {
        return this.hasAttribute('active')
    }

    set active (value) {
        if (value) {
            this.setAttribute('active', '')
        } else {
            this.removeAttribute('active')
        }
    }


    #render () {
        this.#buttonEl = document.createElement('button')
        this.#buttonEl.setAttribute('type', 'button')
        this.#buttonEl.innerHTML = '<slot></slot>'

        this.#buttonEl.addEventListener('click', (e) => {
            if (this.disabled) {
                e.preventDefault()
                e.stopPropagation()
                return
            }
            this.dispatchEvent(new CustomEvent('press', {bubbles: true}))
        })

        this.#updateButton()
        this.shadowRoot.appendChild(this.#buttonEl)
    }


    #updateButton () {
        if (!this.#buttonEl) {
            return
        }

        // Reset classes
        this.#buttonEl.className = ''

        // Variant
        const variant = this.variant
        if (variant !== 'default') {
            this.#buttonEl.classList.add(variant)
        }

        // Icon-only
        if (this.hasAttribute('icon')) {
            this.#buttonEl.classList.add('icon-only')
        }

        // Active state
        if (this.active) {
            this.#buttonEl.classList.add('active')
        }

        // Disabled
        this.#buttonEl.disabled = this.disabled
    }


    // Programmatic API
    focus () {
        this.#buttonEl?.focus()
    }

    blur () {
        this.#buttonEl?.blur()
    }

    click () {
        this.#buttonEl?.click()
    }

}


customElements.define('editor-button', EditorButton)
