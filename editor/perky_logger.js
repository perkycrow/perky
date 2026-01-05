import {buildEditorStyles, editorScrollbarStyles, editorBaseStyles} from './editor_theme.js'
import logger from '../core/logger.js'
import {renderLogItem} from './log_renderers/log_renderer_registry.js'
import './log_renderers/object_log_renderer.js'
import './log_renderers/array_log_renderer.js'
import './log_renderers/perky_module_log_renderer.js'
import './log_renderers/vec2_log_renderer.js'


function createLoggerContent () {
    const content = document.createElement('div')
    content.className = 'logger-content'
    return content
}


export default class PerkyLogger extends HTMLElement {

    static observedAttributes = ['max-entries', 'position', 'timestamp', 'theme']

    #maxEntries = 50
    #position = 'bottom'
    #timestamp = false
    #theme = ''
    #entries = []

    #containerEl = null
    #contentEl = null
    #opacityToggle = null
    #isPinned = true

    #onLog = null
    #onClear = null
    #onSpacer = null
    #onTitle = null

    constructor () {
        super()
        this.attachShadow({mode: 'open'})
    }


    connectedCallback () {
        this.#buildDOM()
        this.#bindLoggerEvents()
    }


    disconnectedCallback () {
        this.#unbindLoggerEvents()
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


    #handleTheme (value) {
        this.#theme = value || ''
    }


    #handleAttributeChange (name, value) {
        const handlers = {
            'max-entries': this.#handleMaxEntries,
            position: this.#handlePosition,
            timestamp: this.#handleTimestamp,
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


    get entries () {
        return this.#entries
    }


    #buildDOM () {
        const style = document.createElement('style')
        style.textContent = STYLES
        this.shadowRoot.appendChild(style)

        this.#containerEl = document.createElement('div')
        this.#updateClasses()

        this.#opacityToggle = document.createElement('button')
        this.#opacityToggle.className = 'logger-pin-toggle pinned'
        this.#opacityToggle.innerHTML = EYE_ICON
        this.#opacityToggle.title = 'Toggle opacity'
        this.#opacityToggle.addEventListener('click', () => this.#togglePin())
        this.#containerEl.appendChild(this.#opacityToggle)

        this.#contentEl = createLoggerContent()
        this.#containerEl.appendChild(this.#contentEl)

        this.shadowRoot.appendChild(this.#containerEl)
    }


    #togglePin () {
        this.#isPinned = !this.#isPinned
        this.#opacityToggle.classList.toggle('pinned', this.#isPinned)
        this.#containerEl.classList.toggle('logger-faded', !this.#isPinned)
    }


    #bindLoggerEvents () {
        this.#replayHistory()

        this.#onLog = ({type, items, timestamp}) => this.#handleLog(type, items, timestamp)
        this.#onClear = () => this.clear()
        this.#onSpacer = () => this.spacer()
        this.#onTitle = ({title}) => this.title(title)

        logger.on('log', this.#onLog)
        logger.on('clear', this.#onClear)
        logger.on('spacer', this.#onSpacer)
        logger.on('title', this.#onTitle)
    }


    #replayHistory () {
        for (const entry of logger.history) {
            this.#replayEntry(entry)
        }
        this.#scrollToBottom()
    }


    #replayEntry (entry) {
        const handlers = {
            log: () => this.#handleLog(entry.type, entry.items, entry.timestamp),
            clear: () => this.clear(),
            spacer: () => this.spacer(),
            title: () => this.title(entry.title)
        }

        handlers[entry.event]?.()
    }


    #unbindLoggerEvents () {
        logger.off('log', this.#onLog)
        logger.off('clear', this.#onClear)
        logger.off('spacer', this.#onSpacer)
        logger.off('title', this.#onTitle)
    }


    #handleLog (type, items, timestamp) {
        const fragment = document.createDocumentFragment()

        items.forEach((item, index) => {
            if (index > 0) {
                fragment.appendChild(document.createTextNode(' '))
            }

            const rendered = renderLogItem(item)
            if (rendered) {
                fragment.appendChild(rendered)
            } else if (typeof item === 'object' && item !== null) {
                fragment.appendChild(document.createTextNode(JSON.stringify(item)))
            } else {
                fragment.appendChild(document.createTextNode(String(item)))
            }
        })

        this.log(fragment, type, 'element', timestamp)
    }


    #updateClasses () {
        if (!this.#containerEl) {
            return
        }

        this.#containerEl.className = `logger logger-${this.#position}`
    }


    #scrollToBottom () {
        if (this.#contentEl) {
            this.#contentEl.scrollTop = this.#contentEl.scrollHeight
        }
    }


    log (message, type = 'info', format = 'text', timestamp = null) {
        const entry = document.createElement('div')
        entry.className = `logger-entry log-${type}`

        const indicator = document.createElement('span')
        indicator.className = 'logger-indicator'
        entry.appendChild(indicator)

        const messageElement = document.createElement('span')
        messageElement.className = 'logger-message'

        processMessage(messageElement, message, format)

        entry.appendChild(messageElement)

        const time = timestamp ? new Date(timestamp) : new Date()
        const timestampEl = document.createElement('span')
        timestampEl.className = 'logger-timestamp'
        timestampEl.textContent = time.toLocaleTimeString()
        entry.appendChild(timestampEl)

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


const EYE_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>'


const STYLES = buildEditorStyles(
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
        margin: 0 10px 10px;
        border-radius: 6px;
        overflow: hidden;
        z-index: 100;
        position: relative;
        background: var(--bg-primary);
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
        border: 1px solid var(--border);
        color: var(--fg-primary);
        transition: opacity 0.2s ease;
    }

    .logger-faded {
        opacity: 0.4;
    }

    .logger-faded:hover {
        opacity: 1;
    }

    .logger-pin-toggle {
        position: absolute;
        top: 4px;
        right: 4px;
        width: 20px;
        height: 20px;
        padding: 2px;
        background: transparent;
        border: none;
        cursor: pointer;
        color: var(--fg-muted);
        opacity: 0.5;
        transition: opacity 0.15s, color 0.15s;
        z-index: 10;
    }

    .logger-pin-toggle:hover {
        opacity: 1;
    }

    .logger-pin-toggle.pinned {
        color: var(--accent);
        opacity: 0.8;
    }

    .logger-pin-toggle.pinned:hover {
        opacity: 1;
    }

    .logger-pin-toggle svg {
        width: 100%;
        height: 100%;
    }

    .logger-content {
        max-height: 250px;
        overflow-y: auto;
    }

    .logger-entry {
        padding: 3px 12px;
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 10px;
    }

    .logger-indicator {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        flex-shrink: 0;
        background: var(--fg-muted);
        opacity: 0.5;
    }

    .log-info .logger-indicator {
        background: var(--fg-muted);
        opacity: 0.5;
    }

    .log-notice .logger-indicator {
        background: var(--fg-muted);
        opacity: 0.3;
    }

    .log-warn .logger-indicator {
        background: var(--status-warning);
        opacity: 1;
    }

    .log-error .logger-indicator {
        background: var(--status-error);
        opacity: 1;
        box-shadow: 0 0 4px var(--status-error);
    }

    .log-success .logger-indicator {
        background: var(--status-success);
        opacity: 1;
    }

    .logger-timestamp {
        color: var(--fg-muted);
        font-size: 10px;
        flex-shrink: 0;
        opacity: 0;
        transition: opacity 0.15s;
    }

    .logger-entry:hover .logger-timestamp {
        opacity: 1;
    }

    .logger-message {
        flex-grow: 1;
        word-break: break-word;
        color: var(--fg-secondary);
    }

    .log-error .logger-message {
        color: var(--fg-primary);
    }

    .logger-spacer {
        height: 1px;
        background: var(--border);
        margin: 4px 12px;
        padding: 0;
        gap: 0;
    }

    .logger-title-entry {
        padding: 6px 12px 2px;
        font-size: 9px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: var(--fg-muted);
    }


    .log-vec2 {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: var(--bg-hover);
        padding: 2px 8px;
        border-radius: 4px;
        font-size: 10px;
    }

    .log-vec2-label {
        color: var(--fg-muted);
        font-weight: 500;
    }

    .log-vec2-values {
        display: inline-flex;
        gap: 8px;
    }

    .log-vec2-component {
        display: inline-flex;
        gap: 4px;
    }

    .log-vec2-key {
        color: var(--fg-muted);
    }

    .log-vec2-value {
        color: var(--accent);
    }


    .log-object,
    .log-array,
    .log-module {
        display: inline-block;
        vertical-align: top;
    }

    .log-object-header,
    .log-array-header,
    .log-module-header {
        display: inline-flex;
        align-items: center;
        gap: 4px;
    }

    .log-object-toggle,
    .log-array-toggle,
    .log-module-toggle {
        color: var(--fg-muted);
        font-size: 8px;
        width: 10px;
        user-select: none;
    }

    .log-object-preview,
    .log-array-preview {
        color: var(--fg-secondary);
    }

    .log-object-expanded,
    .log-array-expanded,
    .log-module-expanded {
        margin-left: 14px;
        padding: 4px 0;
        border-left: 1px solid var(--border);
        padding-left: 8px;
    }

    .log-object-row,
    .log-array-row,
    .log-module-row {
        display: flex;
        gap: 4px;
        padding: 1px 0;
    }

    .log-object-key,
    .log-module-key {
        color: var(--accent);
    }

    .log-array-index {
        color: var(--fg-muted);
        min-width: 20px;
    }

    .log-object-separator,
    .log-array-separator,
    .log-module-separator {
        color: var(--fg-muted);
    }

    .log-object-value,
    .log-array-value,
    .log-module-value {
        color: var(--fg-secondary);
    }

    .log-array-length {
        color: var(--fg-muted);
        font-style: italic;
    }


    .log-module-label {
        color: var(--fg-primary);
        background: var(--bg-hover);
        padding: 2px 8px;
        border-radius: 4px;
    }

    .log-module-meta {
        border-bottom: 1px solid var(--border);
        padding-bottom: 4px;
        margin-bottom: 4px;
    }

    .log-module-meta-row .log-module-key {
        color: var(--fg-muted);
    }

    .log-module-meta-value {
        color: var(--fg-secondary);
    }
`
)


customElements.define('perky-logger', PerkyLogger)
