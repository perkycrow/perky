import BaseInspector from './base_inspector.js'
import PerkyExplorerDetails from '../perky_explorer_details.js'
import InputBinder from '../../input/input_binder.js'
import CompositeBinding from '../../input/composite_binding.js'
import {createElement} from '../../application/dom_utils.js'


export default class InputBinderInspector extends BaseInspector {

    static matches (module) {
        return module instanceof InputBinder
    }

    static styles = `
    .bindings-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 8px;
    }

    .bindings-count {
        font-size: 11px;
        color: var(--fg-muted);
    }

    .bindings-count strong {
        color: var(--fg-primary);
    }

    .view-toggle {
        display: flex;
        gap: 4px;
    }

    .view-btn {
        background: var(--bg-hover);
        border: none;
        border-radius: 4px;
        padding: 4px 8px;
        font-size: 10px;
        color: var(--fg-muted);
        cursor: pointer;
        transition: all 0.15s;
    }

    .view-btn:hover {
        background: var(--bg-primary);
        color: var(--fg-secondary);
    }

    .view-btn.active {
        background: var(--accent);
        color: var(--bg-primary);
    }

    .bindings-list {
        display: flex;
        flex-direction: column;
        gap: 6px;
    }

    .binding-group {
        margin-bottom: 8px;
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

    .binding-card {
        background: var(--bg-hover);
        border-radius: 4px;
        padding: 8px;
        display: flex;
        flex-direction: column;
        gap: 6px;
    }

    .binding-row {
        display: flex;
        align-items: center;
        gap: 8px;
    }


    .binding-input {
        flex: 1;
        display: flex;
        align-items: center;
        gap: 4px;
    }

    .device-badge {
        font-size: 9px;
        background: var(--bg-primary);
        padding: 2px 6px;
        border-radius: 4px;
        color: var(--fg-muted);
    }

    .control-name {
        font-size: 11px;
        font-weight: 600;
        color: var(--fg-primary);
        font-family: var(--font-mono);
    }

    .binding-arrow {
        color: var(--fg-muted);
        font-size: 10px;
    }

    .binding-action {
        display: flex;
        align-items: center;
        gap: 4px;
    }

    .action-name {
        font-size: 11px;
        color: var(--accent);
        font-weight: 500;
    }

    .controller-badge {
        font-size: 9px;
        background: var(--status-warning);
        color: var(--bg-primary);
        padding: 2px 6px;
        border-radius: 4px;
    }

    .event-badge {
        font-size: 9px;
        padding: 2px 6px;
        border-radius: 4px;
    }

    .event-badge.pressed {
        background: var(--status-started);
        color: var(--bg-primary);
    }

    .event-badge.released {
        background: var(--status-stopped);
        color: var(--bg-primary);
    }

    .combo-controls {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
        margin-left: 28px;
    }

    .combo-control {
        display: flex;
        align-items: center;
        gap: 4px;
        background: var(--bg-primary);
        padding: 3px 6px;
        border-radius: 4px;
        font-size: 10px;
    }

    .combo-control .device-badge {
        font-size: 8px;
        padding: 1px 4px;
    }

    .combo-control .control-name {
        font-size: 10px;
    }

    .combo-plus {
        color: var(--fg-muted);
        font-size: 10px;
    }

    .empty-message {
        color: var(--fg-muted);
        font-size: 11px;
        font-style: italic;
        text-align: center;
        padding: 16px;
    }
    `

    #viewMode = 'action'
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

        const bindings = this.module.getAllBindings()

        const header = this.#createHeader(bindings.length)
        this.#containerEl.appendChild(header)

        if (bindings.length === 0) {
            const empty = createElement('div', {class: 'empty-message', text: 'No input bindings defined'})
            this.#containerEl.appendChild(empty)
            return
        }

        const list = createElement('div', {class: 'bindings-list'})

        if (this.#viewMode === 'action') {
            renderByAction(list, bindings)
        } else {
            renderByDevice(list, bindings)
        }

        this.#containerEl.appendChild(list)
    }


    #createHeader (count) {
        const header = createElement('div', {class: 'bindings-header'})

        const countEl = createElement('div', {
            class: 'bindings-count',
            html: `<strong>${count}</strong> binding${count === 1 ? '' : 's'}`
        })

        const toggle = createElement('div', {class: 'view-toggle'})

        const actionBtn = createElement('button', {
            class: `view-btn ${this.#viewMode === 'action' ? 'active' : ''}`,
            text: 'By Action'
        })
        actionBtn.addEventListener('click', () => {
            this.#viewMode = 'action'
            this.#update()
        })

        const deviceBtn = createElement('button', {
            class: `view-btn ${this.#viewMode === 'device' ? 'active' : ''}`,
            text: 'By Device'
        })
        deviceBtn.addEventListener('click', () => {
            this.#viewMode = 'device'
            this.#update()
        })

        toggle.appendChild(actionBtn)
        toggle.appendChild(deviceBtn)

        header.appendChild(countEl)
        header.appendChild(toggle)

        return header
    }

}


function renderByAction (container, bindings) {
    const groups = new Map()

    for (const binding of bindings) {
        const key = binding.actionName
        if (!groups.has(key)) {
            groups.set(key, [])
        }
        groups.get(key).push(binding)
    }

    for (const [actionName, groupBindings] of groups) {
        const group = createGroup(actionName, groupBindings)
        container.appendChild(group)
    }
}


function renderByDevice (container, bindings) {
    const groups = new Map()

    for (const binding of bindings) {
        const key = binding.deviceName
        if (!groups.has(key)) {
            groups.set(key, [])
        }
        groups.get(key).push(binding)
    }

    for (const [deviceName, groupBindings] of groups) {
        const group = createGroup(deviceName, groupBindings)
        container.appendChild(group)
    }
}


function createGroup (name, bindings) {
    const group = createElement('div', {class: 'binding-group'})

    const header = createElement('div', {class: 'group-header'})

    const nameEl = createElement('span', {class: 'group-name', text: name})

    const count = createElement('span', {class: 'group-count', text: bindings.length})

    header.appendChild(nameEl)
    header.appendChild(count)
    group.appendChild(header)

    for (const binding of bindings) {
        group.appendChild(createBindingCard(binding))
    }

    return group
}


function createBindingCard (binding) {
    const card = createElement('div', {class: 'binding-card'})

    const isComposite = binding instanceof CompositeBinding

    const row = createElement('div', {class: 'binding-row'})

    const input = createElement('div', {class: 'binding-input'})

    if (isComposite) {
        const comboLabel = createElement('span', {class: 'control-name', text: 'Combo'})
        input.appendChild(comboLabel)
    } else {
        const device = createElement('span', {class: 'device-badge', text: binding.deviceName})

        const control = createElement('span', {class: 'control-name', text: binding.controlName})

        input.appendChild(device)
        input.appendChild(control)
    }

    const arrow = createElement('span', {class: 'binding-arrow', text: '→'})

    const action = createElement('div', {class: 'binding-action'})

    const actionName = createElement('span', {class: 'action-name', text: binding.actionName})

    action.appendChild(actionName)

    if (binding.controllerName) {
        const controller = createElement('span', {class: 'controller-badge', text: binding.controllerName})
        action.appendChild(controller)
    }

    const eventBadge = createElement('span', {class: `event-badge ${binding.eventType}`, text: binding.eventType})
    action.appendChild(eventBadge)

    row.appendChild(input)
    row.appendChild(arrow)
    row.appendChild(action)
    card.appendChild(row)

    if (isComposite && binding.controls) {
        const comboControls = createElement('div', {class: 'combo-controls'})

        binding.controls.forEach((ctrl, index) => {
            if (index > 0) {
                const plus = createElement('span', {class: 'combo-plus', text: '+'})
                comboControls.appendChild(plus)
            }

            const control = createElement('div', {class: 'combo-control'})

            const device = createElement('span', {class: 'device-badge', text: ctrl.deviceName})

            const name = createElement('span', {class: 'control-name', text: ctrl.controlName})

            control.appendChild(device)
            control.appendChild(name)
            comboControls.appendChild(control)
        })

        card.appendChild(comboControls)
    }

    return card
}


customElements.define('input-binder-inspector', InputBinderInspector)

PerkyExplorerDetails.registerInspector(InputBinderInspector)
