

import {adoptStyles, controlsSheet, createSheet} from '../styles/index.js'


const componentStyles = createSheet(`
    :host {
        display: inline-block;
    }

    button {
        width: 100%;
    }


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


        this.#buttonEl.className = ''


        const variant = this.variant
        if (variant !== 'default') {
            this.#buttonEl.classList.add(variant)
        }


        if (this.hasAttribute('icon')) {
            this.#buttonEl.classList.add('icon-only')
        }


        if (this.active) {
            this.#buttonEl.classList.add('active')
        }


        this.#buttonEl.disabled = this.disabled
    }


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
