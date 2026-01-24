import BaseTool from './base_tool.js'
import {editorScrollbarStyles, editorButtonStyles, editorBaseStyles} from '../../editor_theme.js'
import {ICONS} from '../devtools_icons.js'
import {createElement} from '../../../application/dom_utils.js'


export default class AppsTool extends BaseTool {

    static toolId = 'apps'
    static toolName = 'Applications'
    static toolIcon = ICONS.apps
    static location = 'sidebar'
    static order = 20

    static styles = `
    ${editorScrollbarStyles}
    ${editorButtonStyles}
    ${editorBaseStyles}

    :host {
        display: block;
        height: 100%;
        overflow: auto;
    }

    .apps-container {
        padding: 12px;
    }

    .apps-section {
        margin-bottom: 16px;
    }

    .apps-section:last-child {
        margin-bottom: 0;
    }

    .apps-section-header {
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: var(--fg-muted);
        margin-bottom: 8px;
        padding-bottom: 4px;
        border-bottom: 1px solid var(--border);
    }

    .apps-list {
        display: flex;
        flex-direction: column;
        gap: 6px;
    }

    .apps-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 8px 10px;
        background: var(--bg-secondary);
        border-radius: 4px;
        gap: 8px;
    }

    .apps-item:hover {
        background: var(--bg-hover);
    }

    .apps-item-info {
        display: flex;
        align-items: center;
        gap: 8px;
        flex: 1;
        min-width: 0;
    }

    .apps-item-status {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        flex-shrink: 0;
    }

    .apps-item-status.started {
        background: var(--status-success);
        box-shadow: 0 0 4px var(--status-success);
    }

    .apps-item-status.stopped {
        background: var(--status-error);
    }

    .apps-item-status.disposed {
        background: var(--status-muted);
    }

    .apps-item-name {
        color: var(--fg-primary);
        font-size: 12px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .apps-item-type {
        color: var(--fg-muted);
        font-size: 10px;
        flex-shrink: 0;
    }

    .apps-item-actions {
        display: flex;
        gap: 4px;
        flex-shrink: 0;
    }

    .apps-empty {
        color: var(--fg-muted);
        font-size: 11px;
        font-style: italic;
        padding: 8px 0;
    }
    `

    #containerEl = null
    #registeredListEl = null
    #runningListEl = null
    #appManager = null

    onConnected () {
        this.#buildDOM()
    }


    onStateSet (state) {
        this.#appManager = state.appManager
        this.#refresh()

        state.addEventListener('appmanager:change', (e) => {
            this.#appManager = e.detail.appManager
            this.#refresh()
        })
    }


    onActivate () {
        this.#refresh()
    }


    #buildDOM () {
        this.#containerEl = createElement('div', {class: 'apps-container'})

        const registeredSection = createSection('Registered Apps', 'registered')
        this.#registeredListEl = registeredSection.querySelector('.apps-list')

        const runningSection = createSection('Running Apps', 'running')
        this.#runningListEl = runningSection.querySelector('.apps-list')

        this.#containerEl.appendChild(registeredSection)
        this.#containerEl.appendChild(runningSection)

        this.shadowRoot.appendChild(this.#containerEl)
    }


    #refresh () {
        this.#refreshRegistered()
        this.#refreshRunning()
    }


    #refreshRegistered () {
        if (!this.#registeredListEl) {
            return
        }

        this.#registeredListEl.innerHTML = ''

        if (!this.#appManager) {
            this.#registeredListEl.innerHTML = '<div class="apps-empty">No AppManager connected</div>'
            return
        }

        const registered = Array.from(this.#appManager.constructors.keys)

        if (registered.length === 0) {
            this.#registeredListEl.innerHTML = '<div class="apps-empty">No apps registered</div>'
            return
        }

        for (const name of registered) {
            const item = createRegisteredItem(name)
            this.#registeredListEl.appendChild(item)
        }
    }


    #refreshRunning () {
        if (!this.#runningListEl) {
            return
        }

        this.#runningListEl.innerHTML = ''

        if (!this.#appManager) {
            this.#runningListEl.innerHTML = '<div class="apps-empty">No AppManager connected</div>'
            return
        }

        const running = this.#appManager.list()

        if (running.length === 0) {
            this.#runningListEl.innerHTML = '<div class="apps-empty">No apps running</div>'
            return
        }

        for (const app of running) {
            const item = this.#createRunningItem(app)
            this.#runningListEl.appendChild(item)
        }
    }


    #createRunningItem (app) {
        const item = createElement('div', {class: 'apps-item'})
        const info = createElement('div', {class: 'apps-item-info'})
        const status = createElement('span', {class: `apps-item-status ${getStatusClass(app)}`})
        const nameEl = createElement('span', {class: 'apps-item-name', text: app.$id})
        const typeEl = createElement('span', {class: 'apps-item-type', text: app.constructor.name})

        info.appendChild(status)
        info.appendChild(nameEl)
        info.appendChild(typeEl)

        const actions = createElement('div', {class: 'apps-item-actions'})

        if (app.$status === 'started') {
            const stopBtn = createElement('button', {class: 'editor-btn', text: 'Stop'})
            stopBtn.addEventListener('click', () => this.#stopApp(app.$id))
            actions.appendChild(stopBtn)
        } else if (app.$status === 'stopped') {
            const startBtn = createElement('button', {class: 'editor-btn', text: 'Start'})
            startBtn.addEventListener('click', () => this.#startApp(app.$id))
            actions.appendChild(startBtn)
        }

        const disposeBtn = createElement('button', {class: 'editor-btn', text: 'Dispose'})
        disposeBtn.addEventListener('click', () => this.#disposeApp(app.$id))
        actions.appendChild(disposeBtn)

        item.appendChild(info)
        item.appendChild(actions)

        return item
    }


    #startApp (id) {
        if (!this.#appManager) {
            return
        }

        this.#appManager.startApp(id)
        this.#refresh()
    }


    #stopApp (id) {
        if (!this.#appManager) {
            return
        }

        this.#appManager.stopApp(id)
        this.#refresh()
    }


    #disposeApp (id) {
        if (!this.#appManager) {
            return
        }

        this.#appManager.disposeApp(id)
        this.#refresh()
    }

}


function createSection (title, type) {
    const section = createElement('div', {class: 'apps-section'})
    const header = createElement('div', {class: 'apps-section-header', text: title})
    const list = createElement('div', {class: 'apps-list', attrs: {'data-type': type}})

    section.appendChild(header)
    section.appendChild(list)

    return section
}


function createRegisteredItem (name) {
    const item = createElement('div', {class: 'apps-item'})
    const info = createElement('div', {class: 'apps-item-info'})
    const nameEl = createElement('span', {class: 'apps-item-name', text: name})

    info.appendChild(nameEl)
    item.appendChild(info)

    return item
}


function getStatusClass (app) {
    if (app.$status === 'started') {
        return 'started'
    }
    if (app.$status === 'stopped') {
        return 'stopped'
    }
    if (app.$status === 'disposed') {
        return 'disposed'
    }
    return ''
}


AppsTool.register()


customElements.define('apps-tool', AppsTool)
