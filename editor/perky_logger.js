import {buildEditorStyles, editorHeaderStyles, editorButtonStyles, editorScrollbarStyles, editorBaseStyles} from './editor_theme.js'


export default class PerkyLogger extends HTMLElement {

    static observedAttributes = ['max-entries', 'position', 'timestamp', 'collapsible', 'theme']

    #maxEntries = 50
    #position = 'bottom'
    #timestamp = false
    #collapsible = true
    #theme = ''
    #isMinimized = false
    #isCollapsed = false
    #entries = []

    #containerEl = null
    #headerEl = null
    #contentEl = null
    #miniIconEl = null
    #collapseBtnEl = null


    constructor () {
        super()
        this.attachShadow({mode: 'open'})
    }


    connectedCallback () {
        this.#buildDOM()
    }


    attributeChangedCallback (name, oldValue, newValue) {
        if (oldValue === newValue) {
            return
        }

        this.#handleAttributeChange(name, newValue)
    }


    #handleMaxEntries (value) {
        this.#maxEntries = parseInt(value, 10) || 50
    }


    #handlePosition (value) {
        this.#position = value || 'bottom'
        this.#updateClasses()
    }


    #handleTimestamp (value) {
        this.#timestamp = value !== null && value !== 'false'
    }


    #handleCollapsible (value) {
        this.#collapsible = value !== 'false'
    }


    #handleTheme (value) {
        this.#theme = value || ''
    }


    #handleAttributeChange (name, value) {
        const handlers = {
            'max-entries': this.#handleMaxEntries,
            position: this.#handlePosition,
            timestamp: this.#handleTimestamp,
            collapsible: this.#handleCollapsible,
            theme: this.#handleTheme
        }

        handlers[name]?.call(this, value)
    }


    get maxEntries () {
        return this.#maxEntries
    }


    set maxEntries (value) {
        this.#maxEntries = value
        this.setAttribute('max-entries', value)
    }


    get position () {
        return this.#position
    }


    set position (value) {
        this.#position = value
        this.setAttribute('position', value)
        this.#updateClasses()
    }


    get timestamp () {
        return this.#timestamp
    }


    set timestamp (value) {
        this.#timestamp = value
        if (value) {
            this.setAttribute('timestamp', '')
        } else {
            this.removeAttribute('timestamp')
        }
    }


    get collapsible () {
        return this.#collapsible
    }


    set collapsible (value) {
        this.#collapsible = value
        if (value) {
            this.removeAttribute('collapsible')
        } else {
            this.setAttribute('collapsible', 'false')
        }
    }


    get theme () {
        return this.#theme
    }


    set theme (value) {
        this.#theme = value
        if (value) {
            this.setAttribute('theme', value)
        } else {
            this.removeAttribute('theme')
        }
    }


    get isMinimized () {
        return this.#isMinimized
    }


    set isMinimized (value) {
        this.#isMinimized = value
        this.#updateViewState()
    }


    get isCollapsed () {
        return this.#isCollapsed
    }


    set isCollapsed (value) {
        this.#isCollapsed = value
        this.#updateCollapseState()
    }


    get entries () {
        return this.#entries
    }


    #buildDOM () {
        const style = document.createElement('style')
        style.textContent = STYLES
        this.shadowRoot.appendChild(style)

        this.#containerEl = document.createElement('div')
        this.#updateClasses()

        this.#headerEl = this.#createHeader()
        this.#contentEl = this.#createContent()
        this.#miniIconEl = this.#createMiniIcon()

        this.#containerEl.appendChild(this.#headerEl)
        this.#containerEl.appendChild(this.#contentEl)
        this.#containerEl.appendChild(this.#miniIconEl)

        this.shadowRoot.appendChild(this.#containerEl)

        this.#updateViewState()
    }


    #createHeader () {
        const header = document.createElement('div')
        header.className = 'editor-header'
        header.addEventListener('click', () => this.toggle())

        const title = document.createElement('span')
        title.className = 'editor-header-title'
        title.textContent = 'Logger'

        const buttons = document.createElement('div')
        buttons.className = 'editor-header-buttons'

        const clearBtn = document.createElement('button')
        clearBtn.className = 'editor-btn'
        clearBtn.textContent = 'Clear'
        clearBtn.addEventListener('click', (e) => {
            e.stopPropagation()
            this.clear()
        })

        this.#collapseBtnEl = document.createElement('button')
        this.#collapseBtnEl.className = 'editor-btn'
        this.#collapseBtnEl.textContent = '-'
        this.#collapseBtnEl.addEventListener('click', (e) => {
            e.stopPropagation()
            this.minimize()
        })

        buttons.appendChild(clearBtn)
        buttons.appendChild(this.#collapseBtnEl)

        header.appendChild(title)
        header.appendChild(buttons)

        return header
    }


    #createContent () {
        const content = document.createElement('div')
        content.className = 'logger-content'
        return content
    }


    #createMiniIcon () {
        const miniIcon = document.createElement('div')
        miniIcon.className = 'logger-mini-icon hidden'
        miniIcon.textContent = '\uD83D\uDCCB'
        miniIcon.addEventListener('click', () => this.toggle())
        return miniIcon
    }


    #updateClasses () {
        if (!this.#containerEl) {
            return
        }

        const classes = [
            'logger',
            `logger-${this.#position}`,
            this.#isMinimized ? 'logger-minimized' : ''
        ].filter(Boolean).join(' ')

        this.#containerEl.className = classes
    }


    #updateViewState () {
        if (!this.#containerEl) {
            return
        }

        this.#updateClasses()

        if (this.#isMinimized) {
            this.#headerEl.classList.add('hidden')
            this.#contentEl.classList.add('hidden')
            this.#miniIconEl.classList.remove('hidden')
        } else {
            this.#headerEl.classList.remove('hidden')
            this.#miniIconEl.classList.add('hidden')
            this.#updateCollapseState()
        }
    }


    #updateCollapseState () {
        if (!this.#contentEl || !this.#collapseBtnEl) {
            return
        }

        if (this.#isCollapsed) {
            this.#contentEl.classList.add('hidden')
            this.#collapseBtnEl.textContent = '+'
        } else {
            this.#contentEl.classList.remove('hidden')
            this.#collapseBtnEl.textContent = '-'
        }
    }


    getLoggerClasses () {
        return [
            'logger',
            `logger-${this.#position}`,
            this.#isMinimized ? 'logger-minimized' : ''
        ].filter(Boolean).join(' ')
    }


    log (message, type = 'info', format = 'text') {
        const entry = document.createElement('div')
        entry.className = `logger-entry log-${type}`

        if (this.#timestamp) {
            const timestamp = document.createElement('span')
            timestamp.className = 'logger-timestamp'
            timestamp.textContent = new Date().toLocaleTimeString()
            entry.appendChild(timestamp)
        }

        const messageElement = document.createElement('span')
        messageElement.className = 'logger-message'

        processMessage(messageElement, message, format)

        entry.appendChild(messageElement)

        this.#entries.push(entry)

        while (this.#entries.length > this.#maxEntries) {
            const removed = this.#entries.shift()
            if (removed.parentNode) {
                removed.parentNode.removeChild(removed)
            }
        }

        if (this.#contentEl) {
            this.#contentEl.appendChild(entry)
            this.#contentEl.scrollTop = this.#contentEl.scrollHeight
        }

        return entry
    }


    info (...messages) {
        return this.log(formatMessage(...messages), 'info')
    }


    notice (...messages) {
        return this.log(formatMessage(...messages), 'notice')
    }


    warn (...messages) {
        return this.log(formatMessage(...messages), 'warn')
    }


    error (...messages) {
        return this.log(formatMessage(...messages), 'error')
    }


    success (...messages) {
        return this.log(formatMessage(...messages), 'success')
    }


    spacer () {
        const entry = document.createElement('div')
        entry.className = 'logger-entry logger-spacer'
        this.#entries.push(entry)

        if (this.#contentEl) {
            this.#contentEl.appendChild(entry)
        }
    }


    title (title) {
        const entry = document.createElement('div')
        entry.className = 'logger-entry logger-title-entry'
        entry.textContent = title
        this.#entries.push(entry)

        if (this.#contentEl) {
            this.#contentEl.appendChild(entry)
        }
    }


    clear () {
        this.#entries = []
        if (this.#contentEl) {
            this.#contentEl.innerHTML = ''
        }
    }


    toggle () {
        if (!this.#collapsible) {
            return
        }

        if (this.#isMinimized) {
            this.#isMinimized = false
            this.#isCollapsed = false
            this.#updateViewState()
        } else {
            this.#isCollapsed = !this.#isCollapsed
            this.#updateCollapseState()
        }
    }


    minimize () {
        if (this.#isCollapsed) {
            this.#isCollapsed = false
            this.#updateCollapseState()
            return
        }

        this.#isMinimized = !this.#isMinimized

        if (!this.#isMinimized) {
            this.#isCollapsed = false
        }

        this.#updateViewState()
    }

}


function processMessage (messageElement, message, format) {
    if (format === 'text') {
        messageElement.textContent = message
    } else if (format === 'html') {
        messageElement.innerHTML = message
    } else if (format === 'element') {
        messageElement.appendChild(message)
    }
}


function formatMessage (...messages) {
    return messages.map(m => (typeof m === 'object' ? JSON.stringify(m, null, 2) : m)).join(' ')
}


const STYLES = buildEditorStyles(
    editorHeaderStyles,
    editorButtonStyles,
    editorScrollbarStyles,
    editorBaseStyles,
    `
    :host {
        display: block;
        font-family: var(--font-mono);
        font-size: 12px;
    }

    .logger {
        width: calc(100% - 20px);
        border-radius: 6px;
        overflow: hidden;
        z-index: 100;
        transition: all 0.3s ease;
        position: relative;
        background: var(--bg-primary);
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
        border: 1px solid var(--border);
        color: var(--fg-primary);
    }

    .logger-minimized {
        width: 40px;
        height: 40px;
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        position: absolute;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
        background: var(--bg-primary);
    }

    .logger-minimized.logger-bottom {
        bottom: 10px;
        right: 10px;
        left: auto;
    }

    .logger-minimized.logger-top {
        top: 10px;
        right: 10px;
        left: auto;
    }

    .logger-bottom {
        position: absolute;
        bottom: 10px;
        left: 10px;
    }

    .logger-top {
        position: absolute;
        top: 10px;
        left: 10px;
    }

    .logger-content {
        max-height: 250px;
        overflow-y: auto;
    }

    .logger-mini-icon {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
    }

    .logger-entry {
        padding: 4px 12px;
        display: flex;
        align-items: baseline;
        border-bottom: 1px solid var(--border);
    }

    .logger-entry:last-child {
        border-bottom: none;
    }

    .logger-timestamp {
        color: var(--fg-muted);
        margin-right: 8px;
        font-size: 11px;
        min-width: 70px;
    }

    .logger-message {
        flex-grow: 1;
        word-break: break-word;
    }

    .log-info {
        color: var(--fg-primary);
    }

    .log-notice {
        color: var(--fg-muted);
    }

    .log-warn {
        color: var(--status-warning);
    }

    .log-error {
        color: var(--status-error);
    }

    .log-success {
        color: var(--status-success);
    }

    .logger-spacer {
        height: 1px;
        background-color: var(--border);
    }

    .logger-title-entry {
        font-weight: 500;
        font-size: 14px;
        color: var(--fg-primary);
    }
`)


customElements.define('perky-logger', PerkyLogger)
