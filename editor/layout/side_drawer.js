

import {adoptStyles, createSheet} from '../styles/index.js'


const drawerCSS = createSheet(`
    :host {
        position: absolute;
        top: var(--drawer-top, 0);
        bottom: var(--drawer-bottom, 0);
        width: 280px;
        background: var(--bg-secondary);
        display: flex;
        flex-direction: column;
        transition: transform 0.25s ease-out;
        z-index: 100;
    }

    :host([position="left"]) {
        left: 0;
        border-right: 1px solid var(--border);
        transform: translateX(-100%);
    }

    :host([position="right"]) {
        right: 0;
        border-left: 1px solid var(--border);
        transform: translateX(100%);
    }

    :host([open][position="left"]),
    :host([open][position="right"]) {
        transform: translateX(0);
    }

    .drawer-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: var(--spacing-md) var(--spacing-lg);
        background: var(--bg-tertiary);
        flex-shrink: 0;
    }

    .drawer-title {
        font-size: var(--font-size-md);
        font-weight: 500;
        color: var(--fg-primary);
    }

    .drawer-close {
        appearance: none;
        background: transparent;
        border: none;
        color: var(--fg-secondary);
        width: 32px;
        height: 32px;
        border-radius: var(--radius-md);
        font-size: 16px;
        cursor: pointer;
        transition: background var(--transition-fast), color var(--transition-fast);
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .drawer-close:hover {
        background: var(--bg-hover);
        color: var(--fg-primary);
    }

    .drawer-content {
        flex: 1;
        min-height: 0;
        padding: var(--spacing-md);
        box-sizing: border-box;
        overflow: hidden;
    }

    :host([no-padding]) .drawer-content {
        padding: 0;
    }
`)


export default class SideDrawer extends HTMLElement {

    #headerEl = null
    #titleEl = null
    #contentEl = null

    constructor () {
        super()
        this.attachShadow({mode: 'open'})
        adoptStyles(this.shadowRoot, drawerCSS)
        this.#buildDOM()
    }


    static get observedAttributes () {
        return ['title', 'open']
    }


    attributeChangedCallback (name) {
        if (name === 'title') {
            this.#updateTitle()
        }
    }


    get isOpen () {
        return this.hasAttribute('open')
    }


    open () {
        if (!this.isOpen) {
            this.setAttribute('open', '')
            this.dispatchEvent(new CustomEvent('open', {bubbles: true}))
        }
    }


    close () {
        if (this.isOpen) {
            this.removeAttribute('open')
            this.dispatchEvent(new CustomEvent('close', {bubbles: true}))
        }
    }


    toggle () {
        if (this.isOpen) {
            this.close()
        } else {
            this.open()
        }
    }


    #buildDOM () {
        this.#headerEl = document.createElement('div')
        this.#headerEl.className = 'drawer-header'

        this.#titleEl = document.createElement('span')
        this.#titleEl.className = 'drawer-title'
        this.#updateTitle()

        const closeBtn = document.createElement('button')
        closeBtn.className = 'drawer-close'
        closeBtn.innerHTML = '✕'
        closeBtn.addEventListener('click', () => this.close())

        this.#headerEl.appendChild(this.#titleEl)
        this.#headerEl.appendChild(closeBtn)

        this.#contentEl = document.createElement('div')
        this.#contentEl.className = 'drawer-content'

        const slot = document.createElement('slot')
        this.#contentEl.appendChild(slot)

        this.shadowRoot.appendChild(this.#headerEl)
        this.shadowRoot.appendChild(this.#contentEl)
    }


    #updateTitle () {
        if (this.#titleEl) {
            this.#titleEl.textContent = this.getAttribute('title') || ''
        }
    }

}


customElements.define('side-drawer', SideDrawer)
