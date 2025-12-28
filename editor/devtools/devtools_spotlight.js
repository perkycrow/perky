import BaseEditorComponent from '../base_editor_component.js'
import {buildSpotlightStyles} from './devtools_styles.js'
import {getAllTools} from './devtools_registry.js'


export default class DevToolsSpotlight extends BaseEditorComponent {

    #state = null
    #overlayEl = null
    #containerEl = null
    #inputEl = null
    #resultsEl = null
    #commands = []
    #filteredCommands = []
    #selectedIndex = 0


    connectedCallback () {
        this.#buildDOM()
        this.#buildCommands()
    }


    setState (state) {
        this.#state = state
        this.#buildCommands()
    }


    show () {
        this.#overlayEl?.classList.remove('hidden')
        this.#inputEl?.focus()
        this.#inputEl.value = ''
        this.#selectedIndex = 0
        this.#buildCommands()
        this.#filterCommands('')
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
        this.#overlayEl.className = 'spotlight-overlay hidden'
        this.#overlayEl.addEventListener('click', (e) => {
            if (e.target === this.#overlayEl) {
                this.#state?.closeSpotlight()
            }
        })

        this.#containerEl = document.createElement('div')
        this.#containerEl.className = 'spotlight-container'

        const inputWrapper = document.createElement('div')
        inputWrapper.className = 'spotlight-input-wrapper'

        const icon = document.createElement('span')
        icon.className = 'spotlight-icon'
        icon.textContent = '\uD83D\uDD0D'

        this.#inputEl = document.createElement('input')
        this.#inputEl.className = 'spotlight-input'
        this.#inputEl.type = 'text'
        this.#inputEl.placeholder = 'Type a command...'
        this.#inputEl.addEventListener('input', () => this.#onInput())
        this.#inputEl.addEventListener('keydown', (e) => this.#onKeydown(e))

        inputWrapper.appendChild(icon)
        inputWrapper.appendChild(this.#inputEl)

        this.#resultsEl = document.createElement('div')
        this.#resultsEl.className = 'spotlight-results'

        this.#containerEl.appendChild(inputWrapper)
        this.#containerEl.appendChild(this.#resultsEl)

        this.#overlayEl.appendChild(this.#containerEl)
        this.shadowRoot.appendChild(this.#overlayEl)
    }


    #buildCommands () {
        this.#commands = []

        const tools = getAllTools()
        for (const Tool of tools) {
            this.#commands.push({
                id: `open:${Tool.toolId}`,
                title: `Open ${Tool.toolName}`,
                subtitle: 'Tool',
                icon: Tool.toolIcon,
                action: () => {
                    this.#state?.openTool(Tool.toolId)
                    this.#state?.closeSpotlight()
                }
            })
        }

        this.#commands.push({
            id: 'toggle:logger',
            title: 'Toggle Logger',
            subtitle: 'Panel',
            icon: '\uD83D\uDCCB',
            action: () => {
                this.#state?.toggleLogger()
                this.#state?.closeSpotlight()
            }
        })

        this.#commands.push({
            id: 'close:sidebar',
            title: 'Close Sidebar',
            subtitle: 'Panel',
            icon: '\u2715',
            action: () => {
                this.#state?.closeSidebar()
                this.#state?.closeSpotlight()
            }
        })

        if (this.#state?.appManager) {
            const appManager = this.#state.appManager
            const registered = Array.from(appManager.constructors.keys)

            for (const name of registered) {
                this.#commands.push({
                    id: `spawn:${name}`,
                    title: `Spawn ${name}`,
                    subtitle: 'Application',
                    icon: '\uD83D\uDE80',
                    action: async () => {
                        await appManager.spawn(name)
                        this.#state?.closeSpotlight()
                    }
                })
            }

            const running = appManager.list()
            for (const app of running) {
                if (app.$status === 'started') {
                    this.#commands.push({
                        id: `stop:${app.$id}`,
                        title: `Stop ${app.$id}`,
                        subtitle: 'Application',
                        icon: '\u23F9',
                        action: () => {
                            appManager.stopApp(app.$id)
                            this.#state?.closeSpotlight()
                        }
                    })
                } else if (app.$status === 'stopped') {
                    this.#commands.push({
                        id: `start:${app.$id}`,
                        title: `Start ${app.$id}`,
                        subtitle: 'Application',
                        icon: '\u25B6',
                        action: () => {
                            appManager.startApp(app.$id)
                            this.#state?.closeSpotlight()
                        }
                    })
                }

                this.#commands.push({
                    id: `dispose:${app.$id}`,
                    title: `Dispose ${app.$id}`,
                    subtitle: 'Application',
                    icon: '\uD83D\uDDD1',
                    action: () => {
                        appManager.disposeApp(app.$id)
                        this.#state?.closeSpotlight()
                    }
                })
            }
        }

        this.#filteredCommands = [...this.#commands]
    }


    #onInput () {
        const query = this.#inputEl.value.toLowerCase().trim()
        this.#filterCommands(query)
    }


    #filterCommands (query) {
        if (!query) {
            this.#filteredCommands = [...this.#commands]
        } else {
            this.#filteredCommands = this.#commands.filter(cmd =>
                cmd.title.toLowerCase().includes(query) ||
                cmd.subtitle.toLowerCase().includes(query)
            )
        }

        this.#selectedIndex = 0
        this.#renderResults()
    }


    #renderResults () {
        this.#resultsEl.innerHTML = ''

        if (this.#filteredCommands.length === 0) {
            const empty = document.createElement('div')
            empty.className = 'spotlight-empty'
            empty.textContent = 'No commands found'
            this.#resultsEl.appendChild(empty)
            return
        }

        const groups = this.#groupCommands()

        for (const [subtitle, commands] of Object.entries(groups)) {
            const sectionTitle = document.createElement('div')
            sectionTitle.className = 'spotlight-section-title'
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
        result.className = 'spotlight-result'
        result.dataset.id = cmd.id

        const icon = document.createElement('span')
        icon.className = 'spotlight-result-icon'
        icon.textContent = cmd.icon

        const text = document.createElement('div')
        text.className = 'spotlight-result-text'

        const title = document.createElement('div')
        title.className = 'spotlight-result-title'
        title.textContent = cmd.title

        text.appendChild(title)

        result.appendChild(icon)
        result.appendChild(text)

        result.addEventListener('click', () => cmd.action())
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
        const results = this.#resultsEl.querySelectorAll('.spotlight-result')
        results.forEach((el, index) => {
            const cmdIndex = this.#filteredCommands.findIndex(c => c.id === el.dataset.id)
            el.classList.toggle('selected', cmdIndex === this.#selectedIndex)
        })

        const selectedEl = this.#resultsEl.querySelector('.spotlight-result.selected')
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
                if (this.#filteredCommands[this.#selectedIndex]) {
                    this.#filteredCommands[this.#selectedIndex].action()
                }
                break

            case 'Escape':
                e.preventDefault()
                this.#state?.closeSpotlight()
                break
        }
    }

}


const STYLES = buildSpotlightStyles()


customElements.define('devtools-spotlight', DevToolsSpotlight)
