
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
        header.className = 'perky-logger-header'
        header.addEventListener('click', () => this.toggle())

        const title = document.createElement('span')
        title.className = 'perky-logger-title'
        title.textContent = 'Logger'

        const buttons = document.createElement('div')
        buttons.className = 'perky-logger-buttons'

        const clearBtn = document.createElement('button')
        clearBtn.className = 'perky-logger-clear'
        clearBtn.textContent = 'Clear'
        clearBtn.addEventListener('click', (e) => {
            e.stopPropagation()
            this.clear()
        })

        this.#collapseBtnEl = document.createElement('button')
        this.#collapseBtnEl.className = 'perky-logger-minimize'
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
        content.className = 'perky-logger-content'
        return content
    }


    #createMiniIcon () {
        const miniIcon = document.createElement('div')
        miniIcon.className = 'perky-logger-mini-icon hidden'
        miniIcon.textContent = '\uD83D\uDCCB'
        miniIcon.addEventListener('click', () => this.toggle())
        return miniIcon
    }


    #updateClasses () {
        if (!this.#containerEl) {
            return
        }

        const classes = [
            'perky-logger',
            `perky-logger-${this.#position}`,
            this.#isMinimized ? 'perky-logger-minimized' : ''
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
            'perky-logger',
            `perky-logger-${this.#position}`,
            this.#isMinimized ? 'perky-logger-minimized' : ''
        ].filter(Boolean).join(' ')
    }


    log (message, type = 'info', format = 'text') {
        const entry = document.createElement('div')
        entry.className = `perky-logger-entry perky-logger-${type}`

        if (this.#timestamp) {
            const timestamp = document.createElement('span')
            timestamp.className = 'perky-logger-timestamp'
            timestamp.textContent = new Date().toLocaleTimeString()
            entry.appendChild(timestamp)
        }

        const messageElement = document.createElement('span')
        messageElement.className = 'perky-logger-message'

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
        entry.className = 'perky-logger-entry perky-logger-spacer'
        this.#entries.push(entry)

        if (this.#contentEl) {
            this.#contentEl.appendChild(entry)
        }
    }


    title (title) {
        const entry = document.createElement('div')
        entry.className = 'perky-logger-entry perky-logger-title-entry'
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


const STYLES = `
    :host {
        --bg-fields: #F0F0F0;
        --bg-content: #FAFAFA;
        --bg-headers: #E8E8E8;
        --fg-fields: #6B6B6B;
        --fg-content: #333333;
        --fg-headers: #555555;

        display: block;
        font-family: "Source Code Pro", monospace;
        font-size: 12px;
    }

    @media (prefers-color-scheme: dark) {
        :host {
            --bg-fields: #212125;
            --bg-content: #29292E;
            --bg-headers: #38383D;
            --fg-fields: #8D8E94;
            --fg-content: #8C8C93;
            --fg-headers: #BBBCC3;
        }

        .perky-logger-error {
            color: #FF6B6B;
        }

        .perky-logger-success {
            color: #4BB74A;
        }
    }

    :host([theme="light"]) {
        --bg-fields: #F0F0F0;
        --bg-content: #FAFAFA;
        --bg-headers: #E8E8E8;
        --fg-fields: #6B6B6B;
        --fg-content: #333333;
        --fg-headers: #555555;
    }

    :host([theme="light"]) .perky-logger-error {
        color: #AA3731;
    }

    :host([theme="light"]) .perky-logger-success {
        color: #007A33;
    }

    .perky-logger {
        width: calc(100% - 20px);
        border-radius: 3px;
        overflow: hidden;
        z-index: 100;
        transition: all 0.3s ease;
        position: relative;
        background: var(--bg-content);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        border: 1px solid var(--bg-fields);
        color: var(--fg-content);
    }

    .perky-logger-minimized {
        width: 36px;
        height: 36px;
        border-radius: 3px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        position: absolute;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        background: var(--bg-content);
    }

    .perky-logger-minimized.perky-logger-bottom {
        bottom: 10px;
        right: 10px;
        left: auto;
    }

    .perky-logger-minimized.perky-logger-top {
        top: 10px;
        right: 10px;
        left: auto;
    }

    .perky-logger-bottom {
        position: absolute;
        bottom: 10px;
        left: 10px;
    }

    .perky-logger-top {
        position: absolute;
        top: 10px;
        left: 10px;
    }

    .perky-logger-header {
        display: flex;
        align-items: center;
        padding: 8px 12px;
        cursor: pointer;
        user-select: none;
        justify-content: space-between;
        background: var(--bg-headers);
        border-bottom: 1px solid var(--bg-fields);
    }

    .perky-logger-title {
        flex-grow: 1;
        font-weight: 500;
        color: var(--fg-headers);
        font-size: 0.75rem;
    }

    .perky-logger-buttons {
        display: flex;
        align-items: center;
        gap: 4px;
    }

    .perky-logger-minimize,
    .perky-logger-clear {
        appearance: none;
        background: #ADAFB7;
        border: 0;
        border-radius: 2px;
        color: #29292E;
        min-width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        margin-left: 4px;
        transition: background 0.2s ease;
        font-family: "Source Code Pro", monospace;
        font-size: 0.7rem;
        padding: 3px 6px;
    }

    .perky-logger-minimize:hover,
    .perky-logger-clear:hover {
        background: #9FA1A9;
    }

    .perky-logger-content {
        max-height: 250px;
        overflow-y: auto;
    }

    .perky-logger-mini-icon {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
    }

    .perky-logger-entry {
        padding: 4px 12px;
        display: flex;
        align-items: baseline;
        border-bottom: 1px solid var(--bg-fields);
    }

    .perky-logger-entry:last-child {
        border-bottom: none;
    }

    .perky-logger-timestamp {
        color: var(--fg-fields);
        margin-right: 8px;
        font-size: 11px;
        min-width: 70px;
    }

    .perky-logger-message {
        flex-grow: 1;
        word-break: break-word;
    }

    .perky-logger-info {
        color: var(--fg-content);
    }

    .perky-logger-notice {
        color: var(--fg-fields);
    }

    .perky-logger-warn {
        color: #b08800;
    }

    .perky-logger-error {
        color: #AA3731;
    }

    .perky-logger-success {
        color: #007A33;
    }

    .perky-logger-spacer {
        height: 1px;
        background-color: var(--bg-fields);
    }

    .perky-logger-title-entry {
        font-weight: 500;
        font-size: 14px;
        color: var(--fg-headers);
    }

    .hidden {
        display: none !important;
    }
`


customElements.define('perky-logger', PerkyLogger)
