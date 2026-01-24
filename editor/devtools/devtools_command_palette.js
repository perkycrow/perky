import EditorComponent from '../editor_component.js'
import {commandPaletteStyles} from './devtools.styles.js'
import {editorScrollbarStyles, editorBaseStyles} from '../editor_theme.js'
import {getAllTools} from './devtools_registry.js'
import {parseCommand} from './command_parser.js'
import {ICONS} from './devtools_icons.js'
import logger from '../../core/logger.js'


export default class DevToolsCommandPalette extends EditorComponent {

    static styles = `
    ${editorScrollbarStyles}
    ${editorBaseStyles}
    ${commandPaletteStyles}
    `

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

    onConnected () {
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
                collectActionsFromApp(app, actions)
            }
        }

        return actions
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

        commands.push({
            id: 'inspect',
            title: '/inspect',
            placeholder: 'appId.query(selector)',
            subtitle: 'Inspect module',
            type: 'template',
            icon: ICONS.logger
        })

        this.#addFloatingToolCommands(commands)

        return commands
    }


    #addFloatingToolCommands (commands) {
        const toolManager = this.#state?.toolManager
        if (!toolManager) {
            return
        }

        const tools = toolManager.listTools()
        for (const tool of tools) {
            commands.push({
                id: `tool:${tool.id}`,
                title: `/tool ${tool.id}`,
                placeholder: 'key=value ...',
                subtitle: `Open ${tool.name}`,
                type: 'template',
                icon: tool.icon
            })
        }
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
            Tab: () => {
                this.#autocompleteSelected()
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


    #autocompleteSelected () {
        const selected = this.#filteredCommands[this.#selectedIndex]

        if (selected) {
            this.#inputEl.value = selected.title + ' '
            this.#onInput()
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
            const historyInput = buildHistoryInput(cmd.actionName, args)

            this.#addToHistory(historyInput, cmd)
            cmd.app.actionDispatcher.execute(cmd.actionName, ...args)
            this.#state?.closeCommandPalette()
        } else if (cmd.action) {
            this.#addToHistory(cmd.title, cmd)
            cmd.action()
        }
    }


    #executeTemplateCommand (commandId, arg) {
        if (commandId.startsWith('tool:')) {
            this.#executeToolCommand(commandId)
            return
        }

        const appManager = this.#state?.appManager
        if (!appManager) {
            return
        }

        const handlers = {
            spawn: () => appManager.spawn(arg),
            start: () => appManager.startApp(arg),
            stop: () => appManager.stopApp(arg),
            dispose: () => appManager.disposeApp(arg),
            inspect: () => this.#executeInspectCommand(arg)
        }

        const handler = handlers[commandId]
        if (handler) {
            this.#addToHistory(this.#inputEl.value.trim(), {id: commandId})
            handler()
            this.#state?.closeCommandPalette()
        }
    }


    #executeToolCommand (commandId) {
        const toolManager = this.#state?.toolManager
        if (!toolManager) {
            return
        }

        const toolId = commandId.replace('tool:', '')
        const input = this.#inputEl.value.trim()
        const {args} = parseCommand(input)

        const params = parseToolParams(args)

        this.#addToHistory(input, {id: commandId})
        toolManager.open(toolId, params)
        this.#state?.closeCommandPalette()
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


    #executeInspectCommand (expression) {
        const appManager = this.#state?.appManager
        if (!appManager) {
            return
        }

        const result = evaluateExpression(expression, appManager)

        if (result !== undefined) {
            logger.info(result)
            this.#state?.openLogger()
        }
    }

}


function collectActionsFromApp (app, actions) {
    const actionsMap = app.actionDispatcher?.listAllActions()
    if (!actionsMap) {
        return
    }

    for (const [controllerName, actionInfos] of actionsMap) {
        for (const actionInfo of actionInfos) {
            const actionName = typeof actionInfo === 'string' ? actionInfo : actionInfo.name
            const params = typeof actionInfo === 'object' ? actionInfo.params : []
            const placeholder = formatParamsPlaceholder(params)

            actions.push({
                id: `action:${app.$id}:${controllerName}:${actionName}`,
                title: actionName,
                subtitle: app.$id,
                type: 'action',
                icon: ICONS.action,
                app,
                actionName,
                placeholder
            })
        }
    }
}


function formatParamsPlaceholder (params) {
    if (!params || params.length === 0) {
        return null
    }

    return params.map(p => {
        if (typeof p === 'string') {
            return p
        }
        if (p.defaultValue !== null) {
            return `${p.name}=${p.defaultValue}`
        }
        return p.name
    }).join(', ')
}


function buildHistoryInput (actionName, args) {
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


function evaluateExpression (expression, appManager) {
    const parts = parseExpression(expression)
    const appId = parts[0]
    const app = appManager.getChild(appId)

    if (!app) {
        logger.warn(`App "${appId}" not found`)
        return undefined
    }

    if (parts.length === 1) {
        return app
    }

    let current = app
    for (let i = 1; i < parts.length; i++) {
        const part = parts[i]

        if (part.type === 'method') {
            if (typeof current[part.name] === 'function') {
                current = current[part.name](part.arg)
            } else {
                logger.warn(`Method "${part.name}" not found`)
                return undefined
            }
        } else {
            current = current[part]
        }

        if (current === undefined || current === null) {
            logger.warn(`Property "${part.name || part}" not found`)
            return undefined
        }
    }

    return current
}


function handleQuoteChar (char, state) {
    if ((char === '"' || char === "'") && !state.inQuotes) {
        state.inQuotes = true
        state.quoteChar = char
        return true
    }

    if (char === state.quoteChar && state.inQuotes) {
        state.inQuotes = false
        state.quoteChar = null
        return true
    }

    return false
}


function handleParenChar (char, state) {
    if (char === '(' && !state.inQuotes) {
        state.inParens++
        return true
    }

    if (char === ')' && !state.inQuotes) {
        state.inParens--
        return true
    }

    return false
}


function parseExpression (expression) {
    const parts = []
    let current = ''
    const state = {inParens: 0, inQuotes: false, quoteChar: null}

    for (const char of expression) {
        handleQuoteChar(char, state)
        handleParenChar(char, state)

        if (char === '.' && !state.inQuotes && state.inParens === 0) {
            if (current) {
                parts.push(parsePart(current))
            }
            current = ''
        } else {
            current += char
        }
    }

    if (current) {
        parts.push(parsePart(current))
    }

    return parts
}


function parsePart (part) {
    const methodMatch = part.match(/^(\w+)\((['"]?)(.*)(['"]?)\)$/)
    if (methodMatch) {
        const [, name, , arg] = methodMatch
        return {type: 'method', name, arg}
    }
    return part
}


function parseToolParams (args) {
    const params = {}

    for (const arg of args) {
        if (typeof arg === 'object') {
            Object.assign(params, arg)
            continue
        }

        if (typeof arg !== 'string' || !arg.includes('=')) {
            continue
        }

        const eqIndex = arg.indexOf('=')
        const key = arg.slice(0, eqIndex)
        const value = parseParamValue(arg.slice(eqIndex + 1))
        params[key] = value
    }

    return params
}


function parseParamValue (value) {
    if (value === 'true') {
        return true
    }
    if (value === 'false') {
        return false
    }
    if (!isNaN(value) && value !== '') {
        return Number(value)
    }
    return value
}


function fuzzyScore (query, target) {
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


customElements.define('devtools-command-palette', DevToolsCommandPalette)
