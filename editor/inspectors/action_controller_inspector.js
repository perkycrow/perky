import BaseInspector from './base_inspector.js'
import PerkyExplorerDetails from '../perky_explorer_details.js'
import ActionController from '../../core/action_controller.js'
import {pluralize} from '../../core/utils.js'
import {createElement} from '../../application/dom_utils.js'


export default class ActionControllerInspector extends BaseInspector {

    static matches (module) {
        return module instanceof ActionController
    }

    static styles = `
    .actions-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 8px;
    }

    .actions-count {
        font-size: 11px;
        color: var(--fg-muted);
    }

    .actions-count strong {
        color: var(--fg-primary);
    }

    .actions-list {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    .action-card {
        background: var(--bg-hover);
        border-radius: 4px;
        padding: 8px 10px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
    }

    .action-name {
        font-size: 11px;
        font-weight: 600;
        color: var(--accent);
        font-family: var(--font-mono);
    }

    .action-badge {
        font-size: 9px;
        padding: 2px 6px;
        border-radius: 4px;
        background: var(--bg-primary);
        color: var(--fg-muted);
    }

    .action-badge.propagable {
        background: var(--status-started);
        color: var(--bg-primary);
    }

    .execute-btn {
        background: var(--bg-primary);
        border: 1px solid var(--border);
        border-radius: 4px;
        padding: 3px 8px;
        font-size: 9px;
        color: var(--fg-muted);
        cursor: pointer;
        transition: all 0.15s;
    }

    .execute-btn:hover {
        background: var(--accent);
        color: var(--bg-primary);
        border-color: var(--accent);
    }

    .empty-message {
        color: var(--fg-muted);
        font-size: 11px;
        font-style: italic;
        text-align: center;
        padding: 16px;
    }
    `

    #containerEl = null

    constructor () {
        super()
        this.buildDOM()
    }


    buildDOM () {
        super.buildDOM()

        this.#containerEl = document.createElement('div')
        this.shadowRoot.insertBefore(this.#containerEl, this.gridEl)
        this.gridEl.style.display = 'none'
    }


    onModuleSet (module) {
        if (module) {
            this.#update()
        }
    }


    #update () {
        if (!this.module) {
            return
        }

        this.#containerEl.innerHTML = ''

        const actions = this.module.listActions()

        const header = createHeader(actions.length)
        this.#containerEl.appendChild(header)

        if (actions.length === 0) {
            const empty = createElement('div', {class: 'empty-message', text: 'No actions defined'})
            this.#containerEl.appendChild(empty)
            return
        }

        const list = createElement('div', {class: 'actions-list'})

        for (const actionName of actions) {
            const card = this.#createActionCard(actionName)
            list.appendChild(card)
        }

        this.#containerEl.appendChild(list)
    }


    #createActionCard (actionName) {
        const card = createElement('div', {class: 'action-card'})

        const nameEl = createElement('span', {class: 'action-name', text: actionName})

        const rightSide = document.createElement('div')
        rightSide.style.display = 'flex'
        rightSide.style.alignItems = 'center'
        rightSide.style.gap = '6px'

        const isPropagable = this.module.shouldPropagate(actionName)

        if (isPropagable) {
            const badge = createElement('span', {class: 'action-badge propagable', text: 'propagable'})
            rightSide.appendChild(badge)
        }

        const executeBtn = createElement('button', {class: 'execute-btn', text: '▶ Run'})
        executeBtn.addEventListener('click', () => {
            this.module.execute(actionName)
        })
        rightSide.appendChild(executeBtn)

        card.appendChild(nameEl)
        card.appendChild(rightSide)

        return card
    }

}


function createHeader (count) {
    const header = createElement('div', {class: 'actions-header'})

    const countEl = createElement('div', {
        class: 'actions-count',
        html: `<strong>${count}</strong> ${pluralize('action', count)}`
    })

    header.appendChild(countEl)

    return header
}


customElements.define('action-controller-inspector', ActionControllerInspector)

PerkyExplorerDetails.registerInspector(ActionControllerInspector)
