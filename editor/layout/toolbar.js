/**
 * Toolbar - Horizontal toolbar with slots for controls
 *
 * Usage:
 *   <editor-toolbar>
 *     <div slot="start">Left items</div>
 *     <div slot="center">Center items</div>
 *     <div slot="end">Right items</div>
 *   </editor-toolbar>
 */

import {adoptStyles, createSheet} from '../styles/index.js'


const toolbarCSS = createSheet(`
    :host {
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: 36px;
        padding: 0 var(--spacing-sm);
        background: var(--bg-secondary);
        border-bottom: 1px solid var(--border);
        gap: var(--spacing-sm);
        font-family: var(--font-mono);
    }

    :host([variant="compact"]) {
        height: 28px;
        padding: 0 var(--spacing-xs);
    }

    :host([variant="footer"]) {
        border-bottom: none;
        border-top: 1px solid var(--border);
    }

    :host([no-border]) {
        border: none;
    }

    .toolbar-section {
        display: flex;
        align-items: center;
        gap: var(--spacing-xs);
    }

    .toolbar-start {
        justify-content: flex-start;
    }

    .toolbar-center {
        flex: 1;
        justify-content: center;
    }

    .toolbar-end {
        justify-content: flex-end;
    }

    /* Separator */
    .toolbar-separator {
        width: 1px;
        height: 16px;
        background: var(--border);
        margin: 0 var(--spacing-xs);
    }

    /* Context: Studio */
    :host([context="studio"]) {
        height: var(--touch-target);
        padding: 0 var(--spacing-md);
        gap: var(--spacing-md);
    }

    :host([context="studio"]) .toolbar-section {
        gap: var(--spacing-sm);
    }

    :host([context="studio"]) .toolbar-separator {
        height: 24px;
        margin: 0 var(--spacing-sm);
    }
`)


export default class Toolbar extends HTMLElement {

    constructor () {
        super()
        this.attachShadow({mode: 'open'})
        adoptStyles(this.shadowRoot, toolbarCSS)
        this.#buildDOM()
    }


    static get observedAttributes () {
        return ['variant']
    }


    #buildDOM () {
        // Start section
        const start = document.createElement('div')
        start.className = 'toolbar-section toolbar-start'
        const startSlot = document.createElement('slot')
        startSlot.name = 'start'
        start.appendChild(startSlot)

        // Center section
        const center = document.createElement('div')
        center.className = 'toolbar-section toolbar-center'
        const centerSlot = document.createElement('slot')
        centerSlot.name = 'center'
        center.appendChild(centerSlot)

        // Also accept default slot in center
        const defaultSlot = document.createElement('slot')
        center.appendChild(defaultSlot)

        // End section
        const end = document.createElement('div')
        end.className = 'toolbar-section toolbar-end'
        const endSlot = document.createElement('slot')
        endSlot.name = 'end'
        end.appendChild(endSlot)

        this.shadowRoot.appendChild(start)
        this.shadowRoot.appendChild(center)
        this.shadowRoot.appendChild(end)
    }

}


customElements.define('editor-toolbar', Toolbar)
