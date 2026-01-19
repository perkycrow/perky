/**
 * Overlay - Modal/popup container with backdrop
 *
 * Usage:
 *   <editor-overlay>
 *     <div>Modal content</div>
 *   </editor-overlay>
 *
 *   overlay.open()
 *   overlay.close()
 */

import {adoptStyles, createSheet} from '../styles/index.js'


const overlayCSS = createSheet(`
    :host {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 1000;
        font-family: var(--font-mono);
    }

    :host([open]) {
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .backdrop {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.6);
        backdrop-filter: blur(4px);
        -webkit-backdrop-filter: blur(4px);
    }

    :host([no-backdrop]) .backdrop {
        background: transparent;
        backdrop-filter: none;
        -webkit-backdrop-filter: none;
    }

    .container {
        position: relative;
        background: var(--bg-secondary);
        border: 1px solid var(--border);
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-lg);
        max-width: 90vw;
        max-height: 90vh;
        overflow: auto;
        animation: overlay-enter 0.15s ease-out;
    }

    @keyframes overlay-enter {
        from {
            opacity: 0;
            transform: scale(0.95);
        }
        to {
            opacity: 1;
            transform: scale(1);
        }
    }

    :host([position="top"]) {
        align-items: flex-start;
        padding-top: 10vh;
    }

    :host([position="bottom"]) {
        align-items: flex-end;
        padding-bottom: 10vh;
    }

    /* Fullscreen variant */
    :host([fullscreen]) .container {
        width: 100%;
        height: 100%;
        max-width: 100vw;
        max-height: 100vh;
        border-radius: 0;
        border: none;
    }

    /* Context: Studio */
    :host([context="studio"]) .container {
        border-radius: var(--radius-xl);
    }

    :host([context="studio"][fullscreen]) .container {
        border-radius: 0;
    }
`)


export default class Overlay extends HTMLElement {

    #backdrop = null
    #container = null

    constructor () {
        super()
        this.attachShadow({mode: 'open'})
        adoptStyles(this.shadowRoot, overlayCSS)
        this.#buildDOM()
    }


    static get observedAttributes () {
        return ['open']
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
        this.#backdrop = document.createElement('div')
        this.#backdrop.className = 'backdrop'
        this.#backdrop.addEventListener('click', (e) => {
            if (e.target === this.#backdrop && !this.hasAttribute('no-close-on-backdrop')) {
                this.close()
            }
        })

        this.#container = document.createElement('div')
        this.#container.className = 'container'

        const slot = document.createElement('slot')
        this.#container.appendChild(slot)

        this.shadowRoot.appendChild(this.#backdrop)
        this.shadowRoot.appendChild(this.#container)

        // Close on Escape
        this.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !this.hasAttribute('no-close-on-escape')) {
                this.close()
            }
        })
    }

}


customElements.define('editor-overlay', Overlay)
