import BaseTool from './base_tool.js'
import {buildEditorStyles, editorScrollbarStyles, editorButtonStyles, editorBaseStyles} from '../../editor_theme.js'
import {ICONS} from '../devtools_icons.js'


export default class AppsTool extends BaseTool {

    static toolId = 'apps'
    static toolName = 'Applications'
    static toolIcon = ICONS.apps
    static location = 'sidebar'
    static order = 20

    #containerEl = null
    #registeredListEl = null
    #runningListEl = null
    #appManager = null

    connectedCallback () {
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
        const style = document.createElement('style')
        style.textContent = STYLES
        this.shadowRoot.appendChild(style)

        this.#containerEl = document.createElement('div')
        this.#containerEl.className = 'apps-container'

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
        const item = document.createElement('div')
        item.className = 'apps-item'

        const info = document.createElement('div')
        info.className = 'apps-item-info'

        const status = document.createElement('span')
        status.className = `apps-item-status ${getStatusClass(app)}`

        const nameEl = document.createElement('span')
        nameEl.className = 'apps-item-name'
        nameEl.textContent = app.$id

        const typeEl = document.createElement('span')
        typeEl.className = 'apps-item-type'
        typeEl.textContent = app.constructor.name

        info.appendChild(status)
        info.appendChild(nameEl)
        info.appendChild(typeEl)

        const actions = document.createElement('div')
        actions.className = 'apps-item-actions'

        if (app.$status === 'started') {
            const stopBtn = document.createElement('button')
            stopBtn.className = 'editor-btn'
            stopBtn.textContent = 'Stop'
            stopBtn.addEventListener('click', () => this.#stopApp(app.$id))
            actions.appendChild(stopBtn)
        } else if (app.$status === 'stopped') {
            const startBtn = document.createElement('button')
            startBtn.className = 'editor-btn'
            startBtn.textContent = 'Start'
            startBtn.addEventListener('click', () => this.#startApp(app.$id))
            actions.appendChild(startBtn)
        }

        const disposeBtn = document.createElement('button')
        disposeBtn.className = 'editor-btn'
        disposeBtn.textContent = 'Dispose'
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
    const section = document.createElement('div')
    section.className = 'apps-section'

    const header = document.createElement('div')
    header.className = 'apps-section-header'
    header.textContent = title

    const list = document.createElement('div')
    list.className = 'apps-list'
    list.dataset.type = type

    section.appendChild(header)
    section.appendChild(list)

    return section
}


function createRegisteredItem (name) {
    const item = document.createElement('div')
    item.className = 'apps-item'

    const info = document.createElement('div')
    info.className = 'apps-item-info'

    const nameEl = document.createElement('span')
    nameEl.className = 'apps-item-name'
    nameEl.textContent = name

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


const STYLES = buildEditorStyles(
    editorScrollbarStyles,
    editorButtonStyles,
    editorBaseStyles,
    `
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
)


AppsTool.register()


customElements.define('apps-tool', AppsTool)
