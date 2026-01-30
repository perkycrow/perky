import EditorComponent from '../editor_component.js'
import {createElement} from '../../application/dom_utils.js'


export default class AppLayout extends EditorComponent {

    static styles = `
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


    .header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        min-height: var(--touch-target);
        padding: 0 var(--spacing-md);
        background: var(--bg-secondary);
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

    .title:empty {
        display: none;
    }

    .header-btn {
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

    .header-btn:hover {
        background: var(--bg-hover);
        color: var(--fg-primary);
    }

    .header-btn:active {
        background: var(--bg-selected);
    }

    .header-btn.hidden {
        display: none;
    }


    .content {
        flex: 1;
        overflow: auto;
        position: relative;
    }


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

    :host([no-footer]) .footer {
        display: none;
    }

    :host([no-header]) .header {
        display: none;
    }


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
    `

    #headerEl = null
    #titleEl = null
    #menuBtn = null
    #closeBtn = null
    #contentEl = null
    #footerEl = null

    onConnected () {
        this.#buildDOM()
        this.#updateButtonVisibility()
    }


    static get observedAttributes () {
        return ['title', 'no-header', 'no-footer', 'no-menu', 'no-close']
    }


    attributeChangedCallback (name) {
        if (name === 'title') {
            this.#updateTitle()
        } else if (name === 'no-menu' || name === 'no-close') {
            this.#updateButtonVisibility()
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

        this.#headerEl = createElement('header', {class: 'header'})

        const headerStart = createElement('div', {class: 'header-start'})

        this.#menuBtn = createElement('button', {class: 'header-btn menu-btn', html: '≡'})
        this.#menuBtn.addEventListener('click', () => this.#emitEvent('menu'))
        headerStart.appendChild(this.#menuBtn)

        const headerStartSlot = createElement('slot', {name: 'header-start'})
        headerStart.appendChild(headerStartSlot)

        const headerCenter = createElement('div', {class: 'header-center'})

        this.#titleEl = createElement('span', {class: 'title'})
        headerCenter.appendChild(this.#titleEl)

        const headerCenterSlot = createElement('slot', {name: 'header-center'})
        headerCenter.appendChild(headerCenterSlot)

        const headerEnd = createElement('div', {class: 'header-end'})

        const headerEndSlot = createElement('slot', {name: 'header-end'})
        headerEnd.appendChild(headerEndSlot)

        this.#closeBtn = createElement('button', {class: 'header-btn close-btn', html: '✕'})
        this.#closeBtn.addEventListener('click', () => this.#emitEvent('close'))
        headerEnd.appendChild(this.#closeBtn)

        this.#headerEl.appendChild(headerStart)
        this.#headerEl.appendChild(headerCenter)
        this.#headerEl.appendChild(headerEnd)


        this.#contentEl = createElement('main', {class: 'content'})

        const contentSlot = createElement('slot')
        this.#contentEl.appendChild(contentSlot)


        const overlayContainer = createElement('div', {class: 'overlay-container'})
        const overlaySlot = createElement('slot', {name: 'overlay'})
        overlayContainer.appendChild(overlaySlot)
        this.#contentEl.appendChild(overlayContainer)


        this.#footerEl = createElement('footer', {class: 'footer'})

        const footerStart = createElement('div', {class: 'footer-start'})
        const footerStartSlot = createElement('slot', {name: 'footer-start'})
        footerStart.appendChild(footerStartSlot)

        const footerCenter = createElement('div', {class: 'footer-center'})
        const footerCenterSlot = createElement('slot', {name: 'footer-center'})
        footerCenter.appendChild(footerCenterSlot)

        const footerEnd = createElement('div', {class: 'footer-end'})
        const footerEndSlot = createElement('slot', {name: 'footer-end'})
        footerEnd.appendChild(footerEndSlot)

        this.#footerEl.appendChild(footerStart)
        this.#footerEl.appendChild(footerCenter)
        this.#footerEl.appendChild(footerEnd)


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


    #updateButtonVisibility () {
        if (this.#menuBtn) {
            this.#menuBtn.classList.toggle('hidden', this.hasAttribute('no-menu'))
        }
        if (this.#closeBtn) {
            this.#closeBtn.classList.toggle('hidden', this.hasAttribute('no-close'))
        }
    }


    #emitEvent (name) {
        this.dispatchEvent(new CustomEvent(name, {bubbles: true}))
    }

}


customElements.define('app-layout', AppLayout)
