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
        icon.textContent = '>_'

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


    #buildCommands () { // eslint-disable-line complexity
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
            icon: '<svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>',
            action: () => {
                this.#state?.toggleLogger()
                this.#state?.closeSpotlight()
            }
        })

        this.#commands.push({
            id: 'close:sidebar',
            title: 'Close Sidebar',
            subtitle: 'Panel',
            icon: '<svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>',
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
                    icon: '<svg viewBox="0 0 24 24"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"></path><path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"></path><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"></path><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"></path></svg>',
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
                        icon: '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect></svg>',
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
                        icon: '<svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>',
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
                    icon: '<svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>',
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
        if (query) {
            this.#filteredCommands = this.#commands.filter(cmd =>
                cmd.title.toLowerCase().includes(query) ||
                cmd.subtitle.toLowerCase().includes(query))
        } else {
            this.#filteredCommands = [...this.#commands]
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
        icon.innerHTML = cmd.icon

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
        results.forEach((el) => {
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

        default:
            break
        }
    }

}


const STYLES = buildSpotlightStyles()


customElements.define('devtools-spotlight', DevToolsSpotlight)
