import BaseInspector from './base_inspector.js'
import PerkyExplorerDetails from '../perky_explorer_details.js'
import ActionDispatcher from '../../core/action_dispatcher.js'
import {pluralize} from '../../core/utils.js'


const customStyles = `
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

    .controller-group {
        margin-bottom: 12px;
    }

    .group-header {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 4px 0;
        border-bottom: 1px solid var(--border);
        margin-bottom: 6px;
    }

    .group-name {
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: var(--fg-muted);
        flex: 1;
    }

    .group-count {
        font-size: 9px;
        background: var(--bg-hover);
        padding: 2px 6px;
        border-radius: 8px;
        color: var(--fg-secondary);
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


export default class ActionDispatcherInspector extends BaseInspector {

    static matches (module) {
        return module instanceof ActionDispatcher
    }

    #containerEl = null

    constructor () {
        super(customStyles)
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

        const actionsMap = this.module.listAllActions()
        let totalActions = 0

        for (const actions of actionsMap.values()) {
            totalActions += actions.length
        }

        const header = createHeader(totalActions, actionsMap.size)
        this.#containerEl.appendChild(header)

        if (actionsMap.size === 0) {
            const empty = document.createElement('div')
            empty.className = 'empty-message'
            empty.textContent = 'No controllers registered'
            this.#containerEl.appendChild(empty)
            return
        }

        for (const [controllerName, actions] of actionsMap) {
            const group = this.#createControllerGroup(controllerName, actions)
            this.#containerEl.appendChild(group)
        }
    }


    #createControllerGroup (controllerName, actions) {
        const group = document.createElement('div')
        group.className = 'controller-group'

        const header = document.createElement('div')
        header.className = 'group-header'

        const nameEl = document.createElement('span')
        nameEl.className = 'group-name'
        nameEl.textContent = controllerName

        const count = document.createElement('span')
        count.className = 'group-count'
        count.textContent = actions.length

        header.appendChild(nameEl)
        header.appendChild(count)
        group.appendChild(header)

        if (actions.length === 0) {
            const empty = document.createElement('div')
            empty.className = 'empty-message'
            empty.textContent = 'No actions'
            group.appendChild(empty)
        } else {
            const list = document.createElement('div')
            list.className = 'actions-list'

            for (const actionName of actions) {
                const card = createActionCard(actionName, controllerName, this.module)
                list.appendChild(card)
            }

            group.appendChild(list)
        }

        return group
    }

}


function createHeader (totalActions, controllerCount) {
    const header = document.createElement('div')
    header.className = 'actions-header'

    const countEl = document.createElement('div')
    countEl.className = 'actions-count'
    countEl.innerHTML = `<strong>${totalActions}</strong> ${pluralize('action', totalActions)} in <strong>${controllerCount}</strong> ${pluralize('controller', controllerCount)}`

    header.appendChild(countEl)

    return header
}


function createActionCard (actionName, controllerName, dispatcher) {
    const card = document.createElement('div')
    card.className = 'action-card'

    const nameEl = document.createElement('span')
    nameEl.className = 'action-name'
    nameEl.textContent = actionName

    const executeBtn = document.createElement('button')
    executeBtn.className = 'execute-btn'
    executeBtn.textContent = '▶ Run'
    executeBtn.addEventListener('click', () => {
        dispatcher.executeTo(controllerName, actionName)
    })

    card.appendChild(nameEl)
    card.appendChild(executeBtn)

    return card
}


customElements.define('action-dispatcher-inspector', ActionDispatcherInspector)

PerkyExplorerDetails.registerInspector(ActionDispatcherInspector)
