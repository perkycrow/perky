import EditorComponent from '../editor_component.js'
import {createElement} from '../../application/dom_utils.js'


export default class Toolbar extends EditorComponent {

    static styles = `
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


        .toolbar-separator {
            width: 1px;
            height: 16px;
            background: var(--border);
            margin: 0 var(--spacing-xs);
        }


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
    `

    constructor () {
        super()
        this.#buildDOM()
    }


    static get observedAttributes () {
        return ['variant']
    }


    #buildDOM () {

        const start = createElement('div', {class: 'toolbar-section toolbar-start'})
        const startSlot = createElement('slot', {name: 'start'})
        start.appendChild(startSlot)

        const center = createElement('div', {class: 'toolbar-section toolbar-center'})
        const centerSlot = createElement('slot', {name: 'center'})
        center.appendChild(centerSlot)

        const defaultSlot = document.createElement('slot')
        center.appendChild(defaultSlot)

        const end = createElement('div', {class: 'toolbar-section toolbar-end'})
        const endSlot = createElement('slot', {name: 'end'})
        end.appendChild(endSlot)

        this.shadowRoot.appendChild(start)
        this.shadowRoot.appendChild(center)
        this.shadowRoot.appendChild(end)
    }

}


customElements.define('editor-toolbar', Toolbar)
