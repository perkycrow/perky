import BaseEditorComponent from '../base_editor_component.js'
import {buildCommandPaletteStyles} from './devtools_styles.js'
import {getAllTools} from './devtools_registry.js'
import {parseCommand} from './command_parser.js'
import {ICONS} from './devtools_icons.js'


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
    #history = []
    #maxHistory = 20


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
        this.#showHistory()
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


    #buildInternalCommands () {
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
            id: 'open:logger',
            title: '/open logger',
            subtitle: 'Open Logger panel',
            type: 'command',
            icon: ICONS.logger,
            action: () => {
                this.#state?.openLogger()
                this.#state?.closeCommandPalette()
            }
        })

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

        commands.push({
            id: 'spawn',
            title: '/spawn',
            placeholder: 'appName',
            subtitle: 'Create app instance',
            type: 'template',
            icon: ICONS.spawn
        })

        commands.push({
            id: 'start',
            title: '/start',
            placeholder: 'appId',
            subtitle: 'Start stopped app',
            type: 'template',
            icon: ICONS.start
        })

        commands.push({
            id: 'stop',
            title: '/stop',
            placeholder: 'appId',
            subtitle: 'Stop running app',
            type: 'template',
            icon: ICONS.stop
        })

        commands.push({
            id: 'dispose',
            title: '/dispose',
            placeholder: 'appId',
            subtitle: 'Remove app instance',
            type: 'template',
            icon: ICONS.dispose
        })

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
            this.#showHistory()
        }
    }


    #showHistory () {
        if (this.#history.length === 0) {
            this.#filteredCommands = []
            this.#selectedIndex = 0
            this.#renderResults()
            return
        }

        this.#filteredCommands = this.#history.map((entry, index) => ({
            id: `history:${index}`,
            title: entry.input,
            subtitle: 'Recent',
            type: 'history',
            icon: ICONS.history,
            originalEntry: entry
        }))
        this.#selectedIndex = 0
        this.#renderResults()
    }


    #filterCommands (query, source) {
        if (query) {
            this.#filteredCommands = source
                .map(cmd => ({
                    cmd,
                    score: Math.max(
                        fuzzyScore(query, cmd.title.toLowerCase()),
                        fuzzyScore(query, cmd.subtitle.toLowerCase())
                    )
                }))
                .filter(({score}) => score > 0)
                .sort((a, b) => b.score - a.score)
                .map(({cmd}) => cmd)
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

        if (cmd.placeholder) {
            const placeholder = document.createElement('span')
            placeholder.className = 'command-palette-placeholder'
            placeholder.textContent = ` ${cmd.placeholder}`
            title.appendChild(placeholder)
        }

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
        const keyHandlers = {
            ArrowDown: () => {
                this.#selectedIndex = Math.min(
                    this.#selectedIndex + 1,
                    this.#filteredCommands.length - 1
                )
                this.#updateSelection()
            },
            ArrowUp: () => {
                this.#selectedIndex = Math.max(this.#selectedIndex - 1, 0)
                this.#updateSelection()
            },
            Enter: () => {
                this.#executeCurrentCommand()
            },
            Escape: () => {
                this.#state?.closeCommandPalette()
            }
        }

        const handler = keyHandlers[e.key]
        if (handler) {
            e.preventDefault()
            handler()
        }
    }


    #executeCurrentCommand () {
        const selected = this.#filteredCommands[this.#selectedIndex]

        if (selected) {
            this.#executeCommand(selected)
        }
    }


    #executeCommand (cmd) {
        if (cmd.type === 'history') {
            this.#executeHistoryEntry(cmd.originalEntry)
        } else if (cmd.type === 'template') {
            const input = this.#inputEl.value.trim()
            const {args} = parseCommand(input)

            if (args.length > 0) {
                this.#executeTemplateCommand(cmd.id, args[0])
            } else {
                this.#inputEl.value = `${cmd.title} `
                this.#inputEl.focus()
                this.#onInput()
            }
        } else if (cmd.type === 'action') {
            const input = this.#inputEl.value
            const {args} = parseCommand(input)
            const historyInput = this.#buildHistoryInput(cmd.actionName, args)

            this.#addToHistory(historyInput, cmd)
            cmd.app.actionDispatcher.execute(cmd.actionName, ...args)
            this.#state?.closeCommandPalette()
        } else if (cmd.action) {
            this.#addToHistory(cmd.title, cmd)
            cmd.action()
        }
    }


    #executeTemplateCommand (commandId, arg) {
        const appManager = this.#state?.appManager
        if (!appManager) {
            return
        }

        const handlers = {
            spawn: () => appManager.spawn(arg),
            start: () => appManager.startApp(arg),
            stop: () => appManager.stopApp(arg),
            dispose: () => appManager.disposeApp(arg)
        }

        const handler = handlers[commandId]
        if (handler) {
            this.#addToHistory(this.#inputEl.value.trim(), {id: commandId})
            handler()
            this.#state?.closeCommandPalette()
        }
    }


    #buildHistoryInput (actionName, args) { // eslint-disable-line class-methods-use-this
        if (args.length === 0) {
            return actionName
        }

        const argsString = args.map(arg => {
            if (typeof arg === 'string') {
                return `"${arg}"`
            }
            if (typeof arg === 'object') {
                return JSON.stringify(arg)
            }
            return String(arg)
        }).join(', ')

        return `${actionName} ${argsString}`
    }


    #executeHistoryEntry (entry) {
        this.#inputEl.value = entry.input
        this.#onInput()

        const matchingCmd = this.#filteredCommands.find(c => c.id === entry.cmdId)
        if (matchingCmd) {
            this.#executeCommand(matchingCmd)
        }
    }


    #addToHistory (input, cmd) {
        const entry = {input, cmdId: cmd.id}

        const existingIndex = this.#history.findIndex(e => e.input === input)
        if (existingIndex !== -1) {
            this.#history.splice(existingIndex, 1)
        }

        this.#history.unshift(entry)

        if (this.#history.length > this.#maxHistory) {
            this.#history.pop()
        }
    }

}


function fuzzyScore (query, target) { // eslint-disable-line complexity
    if (target.includes(query)) {
        return 100 + (query.length / target.length) * 50
    }

    let queryIndex = 0
    let score = 0
    let lastMatchIndex = -1

    for (let i = 0; i < target.length && queryIndex < query.length; i++) {
        if (target[i] === query[queryIndex]) {
            score += 10
            if (lastMatchIndex === i - 1) {
                score += 5
            }
            lastMatchIndex = i
            queryIndex++
        }
    }

    if (queryIndex < query.length) {
        return 0
    }

    return score
}


const STYLES = buildCommandPaletteStyles()


customElements.define('devtools-command-palette', DevToolsCommandPalette)
