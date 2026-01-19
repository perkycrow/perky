/**
 * AppLayout - Fullscreen layout for apps (Studio tools, etc.)
 *
 * Structure:
 * ┌─────────────────────────────────────────────────────────────────┐
 * │  [≡]  Title                                    [actions] [✕]   │ ← Header (44px)
 * ├─────────────────────────────────────────────────────────────────┤
 * │                                                                 │
 * │                        CONTENT (slot)                           │
 * │                                                                 │
 * ├─────────────────────────────────────────────────────────────────┤
 * │  [◀]  [toolbar items...]                      [primary action]  │ ← Footer (safe area)
 * └─────────────────────────────────────────────────────────────────┘
 *
 * Usage:
 *   <app-layout>
 *     <div slot="header-start">...</div>
 *     <div slot="header-end">...</div>
 *     <div>Main content</div>
 *     <div slot="footer-start">...</div>
 *     <div slot="footer-end">...</div>
 *   </app-layout>
 */

import {adoptStyles, createSheet} from '../styles/index.js'


const appLayoutCSS = createSheet(`
    :host {
        display: flex;
        flex-direction: column;
        height: 100%;
        width: 100%;
        background: var(--bg-primary);
        color: var(--fg-primary);
        font-family: var(--font-mono);
        overflow: hidden;
    }

    /* Header */
    .header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: var(--touch-target);
        min-height: var(--touch-target);
        padding: 0 var(--spacing-md);
        background: var(--bg-secondary);
        border-bottom: 1px solid var(--border);
        flex-shrink: 0;
        gap: var(--spacing-md);
    }

    .header-start {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
    }

    .header-center {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        flex: 1;
        justify-content: center;
    }

    .header-end {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
    }

    .title {
        font-size: var(--font-size-lg);
        font-weight: 500;
        color: var(--fg-primary);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .menu-btn {
        appearance: none;
        background: transparent;
        border: none;
        color: var(--fg-secondary);
        font-size: 18px;
        width: var(--touch-target);
        height: var(--touch-target);
        min-width: var(--touch-target);
        min-height: var(--touch-target);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        border-radius: var(--radius-md);
        transition: background var(--transition-fast), color var(--transition-fast);
        padding: 0;
    }

    .menu-btn:hover {
        background: var(--bg-hover);
        color: var(--fg-primary);
    }

    .menu-btn:active {
        background: var(--bg-selected);
    }

    /* Content */
    .content {
        flex: 1;
        overflow: auto;
        position: relative;
    }

    ::slotted(*) {
        height: 100%;
    }

    /* Footer */
    .footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        min-height: var(--touch-target);
        padding: var(--spacing-sm) var(--spacing-md);
        padding-bottom: max(var(--spacing-sm), env(safe-area-inset-bottom));
        background: var(--bg-secondary);
        border-top: 1px solid var(--border);
        flex-shrink: 0;
        gap: var(--spacing-md);
    }

    .footer-start {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
    }

    .footer-center {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        flex: 1;
        justify-content: center;
    }

    .footer-end {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
    }

    .footer:empty,
    .footer-start:empty,
    .footer-center:empty,
    .footer-end:empty {
        display: none;
    }

    :host([no-footer]) .footer {
        display: none;
    }

    :host([no-header]) .header {
        display: none;
    }

    /* Overlay slot for modals/panels */
    .overlay-container {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        pointer-events: none;
        z-index: 100;
    }

    .overlay-container ::slotted(*) {
        pointer-events: auto;
    }
`)


export default class AppLayout extends HTMLElement {

    #headerEl = null
    #titleEl = null
    #contentEl = null
    #footerEl = null

    constructor () {
        super()
        this.attachShadow({mode: 'open'})
        adoptStyles(this.shadowRoot, appLayoutCSS)
        this.#buildDOM()
    }


    connectedCallback () {
        this.#updateFooterVisibility()
    }


    static get observedAttributes () {
        return ['title', 'no-header', 'no-footer']
    }


    attributeChangedCallback (name, oldValue, newValue) {
        if (name === 'title') {
            this.#updateTitle()
        }
    }


    get title () {
        return this.getAttribute('title') || ''
    }


    set title (value) {
        this.setAttribute('title', value)
    }


    setTitle (value) {
        this.title = value
    }


    #buildDOM () {
        // Header
        this.#headerEl = document.createElement('header')
        this.#headerEl.className = 'header'

        const headerStart = document.createElement('div')
        headerStart.className = 'header-start'

        const menuBtn = document.createElement('button')
        menuBtn.className = 'menu-btn'
        menuBtn.innerHTML = '≡'
        menuBtn.addEventListener('click', () => this.#emitEvent('menu'))
        headerStart.appendChild(menuBtn)

        const headerStartSlot = document.createElement('slot')
        headerStartSlot.name = 'header-start'
        headerStart.appendChild(headerStartSlot)

        const headerCenter = document.createElement('div')
        headerCenter.className = 'header-center'

        this.#titleEl = document.createElement('span')
        this.#titleEl.className = 'title'
        headerCenter.appendChild(this.#titleEl)

        const headerCenterSlot = document.createElement('slot')
        headerCenterSlot.name = 'header-center'
        headerCenter.appendChild(headerCenterSlot)

        const headerEnd = document.createElement('div')
        headerEnd.className = 'header-end'

        const headerEndSlot = document.createElement('slot')
        headerEndSlot.name = 'header-end'
        headerEnd.appendChild(headerEndSlot)

        const closeBtn = document.createElement('button')
        closeBtn.className = 'menu-btn'
        closeBtn.innerHTML = '✕'
        closeBtn.addEventListener('click', () => this.#emitEvent('close'))
        headerEnd.appendChild(closeBtn)

        this.#headerEl.appendChild(headerStart)
        this.#headerEl.appendChild(headerCenter)
        this.#headerEl.appendChild(headerEnd)

        // Content
        this.#contentEl = document.createElement('main')
        this.#contentEl.className = 'content'

        const contentSlot = document.createElement('slot')
        this.#contentEl.appendChild(contentSlot)

        // Overlay container
        const overlayContainer = document.createElement('div')
        overlayContainer.className = 'overlay-container'
        const overlaySlot = document.createElement('slot')
        overlaySlot.name = 'overlay'
        overlayContainer.appendChild(overlaySlot)
        this.#contentEl.appendChild(overlayContainer)

        // Footer
        this.#footerEl = document.createElement('footer')
        this.#footerEl.className = 'footer'

        const footerStart = document.createElement('div')
        footerStart.className = 'footer-start'
        const footerStartSlot = document.createElement('slot')
        footerStartSlot.name = 'footer-start'
        footerStart.appendChild(footerStartSlot)

        const footerCenter = document.createElement('div')
        footerCenter.className = 'footer-center'
        const footerCenterSlot = document.createElement('slot')
        footerCenterSlot.name = 'footer-center'
        footerCenter.appendChild(footerCenterSlot)

        const footerEnd = document.createElement('div')
        footerEnd.className = 'footer-end'
        const footerEndSlot = document.createElement('slot')
        footerEndSlot.name = 'footer-end'
        footerEnd.appendChild(footerEndSlot)

        this.#footerEl.appendChild(footerStart)
        this.#footerEl.appendChild(footerCenter)
        this.#footerEl.appendChild(footerEnd)

        // Assemble
        this.shadowRoot.appendChild(this.#headerEl)
        this.shadowRoot.appendChild(this.#contentEl)
        this.shadowRoot.appendChild(this.#footerEl)

        this.#updateTitle()
    }


    #updateTitle () {
        if (this.#titleEl) {
            this.#titleEl.textContent = this.title
        }
    }


    #updateFooterVisibility () {
        // Footer is shown if any slot has content
        const hasFooterContent =
            this.querySelector('[slot="footer-start"]') ||
            this.querySelector('[slot="footer-center"]') ||
            this.querySelector('[slot="footer-end"]')

        if (!hasFooterContent && !this.hasAttribute('no-footer')) {
            this.#footerEl.style.display = 'none'
        } else {
            this.#footerEl.style.display = ''
        }
    }


    #emitEvent (name) {
        this.dispatchEvent(new CustomEvent(name, {bubbles: true}))
    }

}


customElements.define('app-layout', AppLayout)
