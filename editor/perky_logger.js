import EditorComponent from './editor_component.js'
import {editorScrollbarStyles, editorBaseStyles} from './editor_theme.js'
import {createElement} from '../application/dom_utils.js'
import {loggerStyles} from './perky_logger.styles.js'
import logger from '../core/logger.js'
import {renderLogItem} from './log_renderers/log_renderer_registry.js'
import './log_renderers/object_log_renderer.js'
import './log_renderers/array_log_renderer.js'
import './log_renderers/perky_module_log_renderer.js'
import './log_renderers/vec2_log_renderer.js'


export default class PerkyLogger extends EditorComponent {

    static observedAttributes = ['max-entries', 'position', 'timestamp', 'theme']

    static styles = [editorScrollbarStyles, editorBaseStyles, loggerStyles]

    #maxEntries = 50
    #position = 'bottom'
    #timestamp = false
    #theme = ''
    #entries = []

    #containerEl = null
    #contentEl = null
    #controlsEl = null
    #opacityToggle = null
    #isPinned = true

    #onLog = null
    #onClear = null
    #onSpacer = null
    #onTitle = null

    onConnected () {
        this.#buildDOM()
        this.#bindLoggerEvents()
    }


    onDisconnected () {
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
            'position': this.#handlePosition,
            'timestamp': this.#handleTimestamp,
            'theme': this.#handleTheme
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
        const wrapper = createElement('div', {class: 'logger-wrapper'})

        this.#controlsEl = createElement('div', {class: 'logger-controls'})

        const clearBtn = createElement('button', {
            class: 'logger-btn',
            html: CLEAR_ICON,
            title: 'Clear logs'
        })
        clearBtn.addEventListener('click', () => this.clear())
        this.#controlsEl.appendChild(clearBtn)

        const copyAllBtn = createElement('button', {
            class: 'logger-btn',
            html: COPY_ICON,
            title: 'Copy all logs'
        })
        copyAllBtn.addEventListener('click', () => this.#copyAllLogs())
        this.#controlsEl.appendChild(copyAllBtn)

        this.#opacityToggle = createElement('button', {
            class: 'logger-btn pinned',
            html: EYE_ICON,
            title: 'Toggle opacity'
        })
        this.#opacityToggle.addEventListener('click', () => this.#togglePin())
        this.#controlsEl.appendChild(this.#opacityToggle)

        wrapper.appendChild(this.#controlsEl)

        this.#containerEl = document.createElement('div')
        this.#updateClasses()

        this.#contentEl = createLoggerContent()
        this.#containerEl.appendChild(this.#contentEl)

        wrapper.appendChild(this.#containerEl)

        this.shadowRoot.appendChild(wrapper)
    }


    #togglePin () {
        this.#isPinned = !this.#isPinned
        this.#opacityToggle.classList.toggle('pinned', this.#isPinned)
        this.#containerEl.classList.toggle('logger-faded', !this.#isPinned)
    }


    #copyAllLogs () {
        const allText = this.#entries
            .map(entry => {
                if (entry.classList.contains('logger-spacer')) {
                    return '---'
                }
                if (entry.classList.contains('logger-title-entry')) {
                    return `=== ${entry.textContent} ===`
                }
                const message = entry.querySelector('.logger-message')
                const timestamp = entry.querySelector('.logger-timestamp')
                if (message && timestamp) {
                    const formattedText = extractFormattedText(message)
                    return `[${timestamp.textContent}] ${formattedText}`
                }
                return ''
            })
            .filter(text => text)
            .join('\n\n')

        copyToClipboard(allText)
    }


    #updateControlsVisibility () {
        if (!this.#controlsEl) {
            return
        }
        const hasEntries = this.#entries.length > 0
        this.#controlsEl.classList.toggle('has-entries', hasEntries)
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
        const entry = createElement('div', {class: `logger-entry log-${type}`})

        const indicator = createElement('span', {class: 'logger-indicator'})
        entry.appendChild(indicator)

        const messageElement = createElement('span', {class: 'logger-message'})

        processMessage(messageElement, message, format)

        entry.appendChild(messageElement)

        const time = timestamp ? new Date(timestamp) : new Date()
        const timestampEl = createElement('span', {
            class: 'logger-timestamp',
            text: time.toLocaleTimeString()
        })
        entry.appendChild(timestampEl)

        const copyBtn = createElement('button', {
            class: 'logger-copy-btn',
            html: COPY_ICON,
            title: 'Copy log entry'
        })
        copyBtn.addEventListener('click', (e) => {
            e.stopPropagation()
            const text = extractFormattedText(messageElement)
            copyToClipboard(`[${timestampEl.textContent}] ${text}`)
        })
        entry.appendChild(copyBtn)

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

        this.#updateControlsVisibility()

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
        const entry = createElement('div', {class: 'logger-entry logger-spacer'})
        this.#entries.push(entry)

        if (this.#contentEl) {
            this.#contentEl.appendChild(entry)
        }
    }


    title (title) {
        const entry = createElement('div', {
            class: 'logger-entry logger-title-entry',
            text: title
        })
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
        this.#updateControlsVisibility()
    }

}


function createLoggerContent () {
    return createElement('div', {class: 'logger-content'})
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


function extractFormattedText (element) {
    const rows = element.querySelectorAll('.log-object-row, .log-array-row, .log-module-row, .log-module-meta-row')

    if (rows.length === 0) {
        return element.textContent.trim()
    }

    const getRowDepth = (row) => {
        let depth = 0
        let parent = row.parentElement

        while (parent && parent !== row.closest('.logger-message')) {
            if (parent.classList.contains('log-object-expanded') ||
                parent.classList.contains('log-array-expanded') ||
                parent.classList.contains('log-module-expanded')) {
                depth++
            }
            parent = parent.parentElement
        }

        return depth
    }

    const lines = Array.from(rows).map(row => {
        const depth = getRowDepth(row)
        const indent = '  '.repeat(depth)
        return indent + row.textContent.trim()
    })

    return lines.join('\n')
}


function copyToClipboard (text) {
    navigator.clipboard.writeText(text).catch(err => {
        logger.error('Failed to copy to clipboard:', err)
    })
}


const EYE_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>'

const CLEAR_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>'

const COPY_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>'


customElements.define('perky-logger', PerkyLogger)
