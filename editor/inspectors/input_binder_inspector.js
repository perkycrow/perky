import BaseInspector from './base_inspector.js'
import PerkyExplorerDetails from '../perky_explorer_details.js'
import InputBinder from '../../input/input_binder.js'
import CompositeBinding from '../../input/composite_binding.js'


const customStyles = `
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


export default class InputBinderInspector extends BaseInspector {

    static matches (module) {
        return module instanceof InputBinder
    }

    #viewMode = 'action'
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

        const bindings = this.module.getAllBindings()

        const header = this.#createHeader(bindings.length)
        this.#containerEl.appendChild(header)

        if (bindings.length === 0) {
            const empty = document.createElement('div')
            empty.className = 'empty-message'
            empty.textContent = 'No input bindings defined'
            this.#containerEl.appendChild(empty)
            return
        }

        const list = document.createElement('div')
        list.className = 'bindings-list'

        if (this.#viewMode === 'action') {
            this.#renderByAction(list, bindings)
        } else {
            this.#renderByDevice(list, bindings)
        }

        this.#containerEl.appendChild(list)
    }


    #createHeader (count) {
        const header = document.createElement('div')
        header.className = 'bindings-header'

        const countEl = document.createElement('div')
        countEl.className = 'bindings-count'
        countEl.innerHTML = `<strong>${count}</strong> binding${count === 1 ? '' : 's'}`

        const toggle = document.createElement('div')
        toggle.className = 'view-toggle'

        const actionBtn = document.createElement('button')
        actionBtn.className = `view-btn ${this.#viewMode === 'action' ? 'active' : ''}`
        actionBtn.textContent = 'By Action'
        actionBtn.addEventListener('click', () => {
            this.#viewMode = 'action'
            this.#update()
        })

        const deviceBtn = document.createElement('button')
        deviceBtn.className = `view-btn ${this.#viewMode === 'device' ? 'active' : ''}`
        deviceBtn.textContent = 'By Device'
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


    #renderByAction (container, bindings) {
        const groups = new Map()

        for (const binding of bindings) {
            const key = binding.actionName
            if (!groups.has(key)) {
                groups.set(key, [])
            }
            groups.get(key).push(binding)
        }

        for (const [actionName, groupBindings] of groups) {
            const group = this.#createGroup('action', actionName, groupBindings)
            container.appendChild(group)
        }
    }


    #renderByDevice (container, bindings) {
        const groups = new Map()

        for (const binding of bindings) {
            const key = binding.deviceName
            if (!groups.has(key)) {
                groups.set(key, [])
            }
            groups.get(key).push(binding)
        }

        for (const [deviceName, groupBindings] of groups) {
            const group = this.#createGroup('device', deviceName, groupBindings)
            container.appendChild(group)
        }
    }


    #createGroup (_type, name, bindings) { // eslint-disable-line class-methods-use-this
        const group = document.createElement('div')
        group.className = 'binding-group'

        const header = document.createElement('div')
        header.className = 'group-header'

        const nameEl = document.createElement('span')
        nameEl.className = 'group-name'
        nameEl.textContent = name

        const count = document.createElement('span')
        count.className = 'group-count'
        count.textContent = bindings.length

        header.appendChild(nameEl)
        header.appendChild(count)
        group.appendChild(header)

        for (const binding of bindings) {
            group.appendChild(createBindingCard(binding))
        }

        return group
    }

}


function createBindingCard (binding) {
    const card = document.createElement('div')
    card.className = 'binding-card'

    const isComposite = binding instanceof CompositeBinding

    const row = document.createElement('div')
    row.className = 'binding-row'

    const input = document.createElement('div')
    input.className = 'binding-input'

    if (isComposite) {
        const comboLabel = document.createElement('span')
        comboLabel.className = 'control-name'
        comboLabel.textContent = 'Combo'
        input.appendChild(comboLabel)
    } else {
        const device = document.createElement('span')
        device.className = 'device-badge'
        device.textContent = binding.deviceName

        const control = document.createElement('span')
        control.className = 'control-name'
        control.textContent = binding.controlName

        input.appendChild(device)
        input.appendChild(control)
    }

    const arrow = document.createElement('span')
    arrow.className = 'binding-arrow'
    arrow.textContent = '→'

    const action = document.createElement('div')
    action.className = 'binding-action'

    const actionName = document.createElement('span')
    actionName.className = 'action-name'
    actionName.textContent = binding.actionName

    action.appendChild(actionName)

    if (binding.controllerName) {
        const controller = document.createElement('span')
        controller.className = 'controller-badge'
        controller.textContent = binding.controllerName
        action.appendChild(controller)
    }

    const eventBadge = document.createElement('span')
    eventBadge.className = `event-badge ${binding.eventType}`
    eventBadge.textContent = binding.eventType
    action.appendChild(eventBadge)

    row.appendChild(input)
    row.appendChild(arrow)
    row.appendChild(action)
    card.appendChild(row)

    if (isComposite && binding.controls) {
        const comboControls = document.createElement('div')
        comboControls.className = 'combo-controls'

        binding.controls.forEach((ctrl, index) => {
            if (index > 0) {
                const plus = document.createElement('span')
                plus.className = 'combo-plus'
                plus.textContent = '+'
                comboControls.appendChild(plus)
            }

            const control = document.createElement('div')
            control.className = 'combo-control'

            const device = document.createElement('span')
            device.className = 'device-badge'
            device.textContent = ctrl.deviceName

            const name = document.createElement('span')
            name.className = 'control-name'
            name.textContent = ctrl.controlName

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
