import BaseEditorComponent from '../base_editor_component.js'
import {buildCommandPaletteStyles} from './devtools_styles.js'
import {getAllTools} from './devtools_registry.js'
import {parseCommand} from './command_parser.js'


export default class DevToolsCommandPalette extends BaseEditorComponent {

    #state = null
    #overlayEl = null
    #containerEl = null
    #inputEl = null
    #resultsEl = null
    #appActions = []
    #internalCommands = []
    #filteredCommands = []
    #selectedIndex = 0


    connectedCallback () {
        this.#buildDOM()
        this.#rebuildAll()
    }


    setState (state) {
        this.#state = state
        this.#rebuildAll()
    }


    show () {
        this.#overlayEl?.classList.remove('hidden')
        this.#inputEl?.focus()
        this.#inputEl.value = ''
        this.#selectedIndex = 0
        this.#rebuildAll()
        this.#filteredCommands = []
        this.#renderResults()
    }


    hide () {
        this.#overlayEl?.classList.add('hidden')
        this.#inputEl.value = ''
    }


    #buildDOM () {
        const style = document.createElement('style')
        style.textContent = STYLES
        this.shadowRoot.appendChild(style)

        this.#overlayEl = document.createElement('div')
        this.#overlayEl.className = 'command-palette-overlay hidden'
        this.#overlayEl.addEventListener('click', (e) => {
            if (e.target === this.#overlayEl) {
                this.#state?.closeCommandPalette()
            }
        })

        this.#containerEl = document.createElement('div')
        this.#containerEl.className = 'command-palette-container'

        const inputWrapper = document.createElement('div')
        inputWrapper.className = 'command-palette-input-wrapper'

        const icon = document.createElement('span')
        icon.className = 'command-palette-icon'
        icon.textContent = '>_'

        this.#inputEl = document.createElement('input')
        this.#inputEl.className = 'command-palette-input'
        this.#inputEl.type = 'text'
        this.#inputEl.placeholder = 'Type a command...'
        this.#inputEl.addEventListener('input', () => this.#onInput())
        this.#inputEl.addEventListener('keydown', (e) => this.#onKeydown(e))

        inputWrapper.appendChild(icon)
        inputWrapper.appendChild(this.#inputEl)

        this.#resultsEl = document.createElement('div')
        this.#resultsEl.className = 'command-palette-results'

        this.#containerEl.appendChild(inputWrapper)
        this.#containerEl.appendChild(this.#resultsEl)

        this.#overlayEl.appendChild(this.#containerEl)
        this.shadowRoot.appendChild(this.#overlayEl)
    }


    #rebuildAll () {
        this.#appActions = this.#buildAppActions()
        this.#internalCommands = this.#buildInternalCommands()
    }


    #buildAppActions () {
        const actions = []
        const apps = this.#state?.appManager?.list() || []

        for (const app of apps) {
            if (app.$status === 'started') {
                this.#collectActionsFromApp(app, actions)
            }
        }

        return actions
    }


    #collectActionsFromApp (app, actions) { // eslint-disable-line class-methods-use-this
        const actionsMap = app.actionDispatcher?.listAllActions()
        if (!actionsMap) {
            return
        }

        for (const [controllerName, actionNames] of actionsMap) {
            for (const actionName of actionNames) {
                actions.push({
                    id: `action:${app.$id}:${controllerName}:${actionName}`,
                    title: actionName,
                    subtitle: app.$id,
                    type: 'action',
                    icon: ICONS.action,
                    app,
                    actionName
                })
            }
        }
    }


    #buildInternalCommands () { // eslint-disable-line complexity
        const commands = []

        const tools = getAllTools()
        for (const Tool of tools) {
            commands.push({
                id: `open:${Tool.toolId}`,
                title: `/open ${Tool.toolId}`,
                subtitle: `Open ${Tool.toolName}`,
                type: 'command',
                icon: Tool.toolIcon,
                action: () => {
                    this.#state?.openTool(Tool.toolId)
                    this.#state?.closeCommandPalette()
                }
            })
        }

        commands.push({
            id: 'toggle:logger',
            title: '/toggle logger',
            subtitle: 'Toggle Logger panel',
            type: 'command',
            icon: ICONS.logger,
            action: () => {
                this.#state?.toggleLogger()
                this.#state?.closeCommandPalette()
            }
        })

        commands.push({
            id: 'close:sidebar',
            title: '/close sidebar',
            subtitle: 'Close Sidebar panel',
            type: 'command',
            icon: ICONS.close,
            action: () => {
                this.#state?.closeSidebar()
                this.#state?.closeCommandPalette()
            }
        })

        if (this.#state?.appManager) {
            const appManager = this.#state.appManager
            const registered = Array.from(appManager.constructors.keys)

            for (const name of registered) {
                commands.push({
                    id: `spawn:${name}`,
                    title: `/spawn ${name}`,
                    subtitle: 'Create app instance',
                    type: 'command',
                    icon: ICONS.spawn,
                    action: async () => {
                        await appManager.spawn(name)
                        this.#state?.closeCommandPalette()
                    }
                })
            }

            const running = appManager.list()
            for (const app of running) {
                if (app.$status === 'started') {
                    commands.push({
                        id: `stop:${app.$id}`,
                        title: `/stop ${app.$id}`,
                        subtitle: 'Stop running app',
                        type: 'command',
                        icon: ICONS.stop,
                        action: () => {
                            appManager.stopApp(app.$id)
                            this.#state?.closeCommandPalette()
                        }
                    })
                } else if (app.$status === 'stopped') {
                    commands.push({
                        id: `start:${app.$id}`,
                        title: `/start ${app.$id}`,
                        subtitle: 'Start stopped app',
                        type: 'command',
                        icon: ICONS.start,
                        action: () => {
                            appManager.startApp(app.$id)
                            this.#state?.closeCommandPalette()
                        }
                    })
                }

                commands.push({
                    id: `dispose:${app.$id}`,
                    title: `/dispose ${app.$id}`,
                    subtitle: 'Remove app instance',
                    type: 'command',
                    icon: ICONS.dispose,
                    action: () => {
                        appManager.disposeApp(app.$id)
                        this.#state?.closeCommandPalette()
                    }
                })
            }
        }

        return commands
    }


    #onInput () {
        const raw = this.#inputEl.value
        const query = raw.trim().toLowerCase()
        const commandPart = query.split(' ')[0]

        if (raw.startsWith('/')) {
            const commandQuery = commandPart.slice(1)
            this.#filterCommands(commandQuery, this.#internalCommands)
        } else if (query) {
            this.#filterCommands(commandPart, this.#appActions)
        } else {
            this.#filteredCommands = []
            this.#selectedIndex = 0
            this.#renderResults()
        }
    }


    #filterCommands (query, source) {
        if (query) {
            this.#filteredCommands = source.filter(cmd =>
                cmd.title.toLowerCase().includes(query) ||
                cmd.subtitle.toLowerCase().includes(query))
        } else {
            this.#filteredCommands = [...source]
        }

        this.#selectedIndex = 0
        this.#renderResults()
    }


    #renderResults () {
        this.#resultsEl.innerHTML = ''

        if (this.#filteredCommands.length === 0) {
            const query = this.#inputEl.value.trim()
            if (query) {
                const empty = document.createElement('div')
                empty.className = 'command-palette-empty'
                empty.textContent = 'No results found'
                this.#resultsEl.appendChild(empty)
            } else {
                const hint = document.createElement('div')
                hint.className = 'command-palette-hint'
                hint.textContent = 'Type to search actions, / for commands'
                this.#resultsEl.appendChild(hint)
            }
            return
        }

        const groups = this.#groupCommands()

        for (const [subtitle, commands] of Object.entries(groups)) {
            const sectionTitle = document.createElement('div')
            sectionTitle.className = 'command-palette-section-title'
            sectionTitle.textContent = subtitle
            this.#resultsEl.appendChild(sectionTitle)

            for (const cmd of commands) {
                const result = this.#createResultItem(cmd)
                this.#resultsEl.appendChild(result)
            }
        }

        this.#updateSelection()
    }


    #groupCommands () {
        const groups = {}

        for (const cmd of this.#filteredCommands) {
            if (!groups[cmd.subtitle]) {
                groups[cmd.subtitle] = []
            }
            groups[cmd.subtitle].push(cmd)
        }

        return groups
    }


    #createResultItem (cmd) {
        const result = document.createElement('div')
        result.className = 'command-palette-result'
        result.dataset.id = cmd.id

        const icon = document.createElement('span')
        icon.className = 'command-palette-result-icon'
        icon.innerHTML = cmd.icon

        const text = document.createElement('div')
        text.className = 'command-palette-result-text'

        const title = document.createElement('div')
        title.className = 'command-palette-result-title'
        title.textContent = cmd.title

        text.appendChild(title)

        result.appendChild(icon)
        result.appendChild(text)

        result.addEventListener('click', () => this.#executeCommand(cmd))
        result.addEventListener('mouseenter', () => {
            const index = this.#filteredCommands.findIndex(c => c.id === cmd.id)
            if (index >= 0) {
                this.#selectedIndex = index
                this.#updateSelection()
            }
        })

        return result
    }


    #updateSelection () {
        const results = this.#resultsEl.querySelectorAll('.command-palette-result')
        results.forEach((el) => {
            const cmdIndex = this.#filteredCommands.findIndex(c => c.id === el.dataset.id)
            el.classList.toggle('selected', cmdIndex === this.#selectedIndex)
        })

        const selectedEl = this.#resultsEl.querySelector('.command-palette-result.selected')
        if (selectedEl) {
            selectedEl.scrollIntoView({block: 'nearest'})
        }
    }


    #onKeydown (e) {
        switch (e.key) {
        case 'ArrowDown':
            e.preventDefault()
            this.#selectedIndex = Math.min(
                this.#selectedIndex + 1,
                this.#filteredCommands.length - 1
            )
            this.#updateSelection()
            break

        case 'ArrowUp':
            e.preventDefault()
            this.#selectedIndex = Math.max(this.#selectedIndex - 1, 0)
            this.#updateSelection()
            break

        case 'Enter':
            e.preventDefault()
            this.#executeCurrentCommand()
            break

        case 'Escape':
            e.preventDefault()
            this.#state?.closeCommandPalette()
            break

        default:
            break
        }
    }


    #executeCurrentCommand () {
        const selected = this.#filteredCommands[this.#selectedIndex]

        if (selected) {
            this.#executeCommand(selected)
        }
    }


    #executeCommand (cmd) {
        if (cmd.type === 'action') {
            const input = this.#inputEl.value
            const {args} = parseCommand(input)

            cmd.app.actionDispatcher.execute(cmd.actionName, ...args)
            this.#state?.closeCommandPalette()
        } else if (cmd.action) {
            cmd.action()
        }
    }

}


const ICONS = {
    action: '<svg viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>',
    logger: '<svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>',
    close: '<svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>',
    spawn: '<svg viewBox="0 0 24 24"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"></path><path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"></path><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"></path><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"></path></svg>',
    start: '<svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>',
    stop: '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect></svg>',
    dispose: '<svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>'
}


const STYLES = buildCommandPaletteStyles()


customElements.define('devtools-command-palette', DevToolsCommandPalette)
