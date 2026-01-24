

import {adoptStyles, createStyleSheet} from '../styles/index.js'


const panelCSS = createStyleSheet(`
    :host {
        display: block;
        background: var(--bg-secondary);
        border: 1px solid var(--border);
        border-radius: var(--radius-lg);
        overflow: hidden;
        font-family: var(--font-mono);
        box-shadow: var(--shadow-md);
    }

    :host([floating]) {
        position: absolute;
        min-width: 200px;
        min-height: 100px;
        resize: both;
        overflow: auto;
    }

    :host([collapsed]) {
        height: auto !important;
        min-height: 0;
        resize: none;
    }

    :host([collapsed]) .panel-content {
        display: none;
    }


    .panel-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: 32px;
        padding: 0 var(--spacing-sm);
        background: var(--bg-tertiary);
        border-bottom: 1px solid var(--border);
        cursor: default;
        user-select: none;
        -webkit-user-select: none;
        gap: var(--spacing-xs);
    }

    :host([floating]) .panel-header {
        cursor: grab;
    }

    :host([floating]) .panel-header:active {
        cursor: grabbing;
    }

    .panel-title {
        font-size: var(--font-size-sm);
        font-weight: 500;
        color: var(--fg-primary);
        flex: 1;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .panel-actions {
        display: flex;
        align-items: center;
        gap: 2px;
    }

    .panel-btn {
        appearance: none;
        background: transparent;
        border: none;
        color: var(--fg-muted);
        font-size: 12px;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        border-radius: var(--radius-sm);
        transition: background var(--transition-fast), color var(--transition-fast);
        padding: 0;
    }

    .panel-btn:hover {
        background: var(--bg-hover);
        color: var(--fg-primary);
    }

    .panel-btn:active {
        background: var(--bg-selected);
    }


    .panel-content {
        padding: var(--spacing-sm);
        overflow: auto;
        max-height: 400px;
    }

    :host([no-padding]) .panel-content {
        padding: 0;
    }


    :host([context="studio"]) .panel-header {
        height: var(--touch-target);
        padding: 0 var(--spacing-md);
    }

    :host([context="studio"]) .panel-title {
        font-size: var(--font-size-md);
    }

    :host([context="studio"]) .panel-btn {
        width: var(--touch-target);
        height: var(--touch-target);
        font-size: 16px;
    }

    :host([context="studio"]) .panel-content {
        padding: var(--spacing-md);
    }

    :host([context="studio"][no-padding]) .panel-content {
        padding: 0;
    }
`)


export default class Panel extends HTMLElement {

    #headerEl = null
    #titleEl = null
    #contentEl = null
    #collapseBtn = null

    #isDragging = false
    #dragStartX = 0
    #dragStartY = 0
    #initialX = 0
    #initialY = 0

    constructor () {
        super()
        this.attachShadow({mode: 'open'})
        adoptStyles(this.shadowRoot, panelCSS)
        this.#buildDOM()
    }


    connectedCallback () {
        this.#updateCollapseIcon()
    }


    static get observedAttributes () {
        return ['title', 'collapsed', 'floating']
    }


    attributeChangedCallback (name) {
        if (name === 'title') {
            this.#updateTitle()
        } else if (name === 'collapsed') {
            this.#updateCollapseIcon()
        }
    }


    get title () {
        return this.getAttribute('title') || ''
    }


    set title (value) {
        this.setAttribute('title', value)
    }


    get collapsed () {
        return this.hasAttribute('collapsed')
    }


    set collapsed (value) {
        if (value) {
            this.setAttribute('collapsed', '')
        } else {
            this.removeAttribute('collapsed')
        }
    }


    get floating () {
        return this.hasAttribute('floating')
    }


    set floating (value) {
        if (value) {
            this.setAttribute('floating', '')
        } else {
            this.removeAttribute('floating')
        }
    }


    toggle () {
        this.collapsed = !this.collapsed
    }


    #buildDOM () {

        this.#headerEl = document.createElement('div')
        this.#headerEl.className = 'panel-header'
        this.#headerEl.addEventListener('pointerdown', (e) => this.#handleDragStart(e))

        this.#titleEl = document.createElement('span')
        this.#titleEl.className = 'panel-title'
        this.#titleEl.textContent = this.title

        const actions = document.createElement('div')
        actions.className = 'panel-actions'

        this.#collapseBtn = document.createElement('button')
        this.#collapseBtn.className = 'panel-btn'
        this.#collapseBtn.innerHTML = '−'
        this.#collapseBtn.addEventListener('click', (e) => {
            e.stopPropagation()
            this.toggle()
        })

        const closeBtn = document.createElement('button')
        closeBtn.className = 'panel-btn'
        closeBtn.innerHTML = '✕'
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation()
            this.#emitEvent('close')
        })

        actions.appendChild(this.#collapseBtn)
        actions.appendChild(closeBtn)

        this.#headerEl.appendChild(this.#titleEl)
        this.#headerEl.appendChild(actions)


        this.#contentEl = document.createElement('div')
        this.#contentEl.className = 'panel-content'

        const slot = document.createElement('slot')
        this.#contentEl.appendChild(slot)


        this.shadowRoot.appendChild(this.#headerEl)
        this.shadowRoot.appendChild(this.#contentEl)

        this.#updateTitle()
    }


    #updateTitle () {
        if (this.#titleEl) {
            this.#titleEl.textContent = this.title
        }
    }


    #updateCollapseIcon () {
        if (this.#collapseBtn) {
            this.#collapseBtn.innerHTML = this.collapsed ? '+' : '−'
        }
    }


    #handleDragStart (e) {
        if (!this.floating || e.target.closest('.panel-btn')) {
            return
        }

        this.#isDragging = true
        this.#dragStartX = e.clientX
        this.#dragStartY = e.clientY
        this.#initialX = this.offsetLeft
        this.#initialY = this.offsetTop

        this.#headerEl.setPointerCapture(e.pointerId)

        const handleMove = (moveEvent) => {
            if (!this.#isDragging) {
                return
            }

            const deltaX = moveEvent.clientX - this.#dragStartX
            const deltaY = moveEvent.clientY - this.#dragStartY

            this.style.left = `${this.#initialX + deltaX}px`
            this.style.top = `${this.#initialY + deltaY}px`
        }

        const handleEnd = () => {
            this.#isDragging = false
            this.#headerEl.removeEventListener('pointermove', handleMove)
            this.#headerEl.removeEventListener('pointerup', handleEnd)
            this.#headerEl.removeEventListener('pointercancel', handleEnd)
        }

        this.#headerEl.addEventListener('pointermove', handleMove)
        this.#headerEl.addEventListener('pointerup', handleEnd)
        this.#headerEl.addEventListener('pointercancel', handleEnd)
    }


    #emitEvent (name) {
        this.dispatchEvent(new CustomEvent(name, {bubbles: true}))
    }

}


customElements.define('editor-panel', Panel)
