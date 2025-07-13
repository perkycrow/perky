import {LitElement, html, css} from 'lit'


export default class PerkyLogger extends LitElement {

    static properties = {
        maxEntries: {type: Number},
        position: {type: String},
        timestamp: {type: Boolean},
        collapsible: {type: Boolean},
        theme: {type: String, reflect: true},
        isMinimized: {type: Boolean, state: true},
        isCollapsed: {type: Boolean, state: true},
        entries: {type: Array, state: true}
    }


    static styles = css`
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

        /* Hidden states */
        .hidden {
            display: none !important;
        }
    `


    constructor () {
        super()
        
        this.maxEntries = 50
        this.position = 'bottom'
        this.timestamp = false
        this.collapsible = true
        this.theme = ''
        this.isMinimized = false
        this.isCollapsed = false
        this.entries = []
    }


    render () {
        const loggerClasses = this.getLoggerClasses()

        return html`
            <div class="${loggerClasses}">
                ${this.renderHeader()}
                ${this.renderContent()}
                ${this.renderMiniIcon()}
            </div>
        `
    }


    getLoggerClasses () {
        return [
            'perky-logger',
            `perky-logger-${this.position}`,
            this.isMinimized ? 'perky-logger-minimized' : ''
        ].filter(Boolean).join(' ')
    }


    renderHeader () {
        return html`
            <div class="perky-logger-header ${this.isMinimized ? 'hidden' : ''}" @click="${this.toggle}">
                <span class="perky-logger-title">Logger</span>
                <div class="perky-logger-buttons">
                    <button class="perky-logger-clear" @click="${this.handleClear}">Clear</button>
                    <button class="perky-logger-minimize" @click="${this.handleMinimize}">
                        ${this.isCollapsed ? '+' : '-'}
                    </button>
                </div>
            </div>
        `
    }


    renderContent () {
        return html`
            <div class="perky-logger-content ${this.isCollapsed || this.isMinimized ? 'hidden' : ''}">
                ${this.entries.map(entry => html`${entry}`)}
            </div>
        `
    }


    renderMiniIcon () {
        return html`
            <div class="perky-logger-mini-icon ${this.isMinimized ? '' : 'hidden'}" @click="${this.toggle}">
                📋
            </div>
        `
    }


    log (message, type = 'info', format = 'text') {
        const entry = document.createElement('div')
        entry.className = `perky-logger-entry perky-logger-${type}`

        if (this.timestamp) {
            const timestamp = document.createElement('span')
            timestamp.className = 'perky-logger-timestamp'
            timestamp.textContent = new Date().toLocaleTimeString()
            entry.appendChild(timestamp)
        }

        const messageElement = document.createElement('span')
        messageElement.className = 'perky-logger-message'

        processMessage(messageElement, message, format)

        entry.appendChild(messageElement)

        this.entries = [...this.entries, entry]

        while (this.entries.length > this.maxEntries) {
            this.entries = this.entries.slice(1)
        }

        this.requestUpdate()
        
        this.updateComplete.then(() => {
            const content = this.shadowRoot.querySelector('.perky-logger-content')
            if (content) {
                content.scrollTop = content.scrollHeight
            }
        })

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
        this.entries = [...this.entries, entry]
        this.requestUpdate()
    }


    title (title) {
        const entry = document.createElement('div')
        entry.className = 'perky-logger-entry perky-logger-title-entry'
        entry.textContent = title
        this.entries = [...this.entries, entry]
        this.requestUpdate()
    }


    clear () {
        this.entries = []
        this.requestUpdate()
    }


    toggle () {
        if (!this.collapsible) {
            return
        }

        if (this.isMinimized) {
            this.isMinimized = false
            this.isCollapsed = false
        } else {
            this.isCollapsed = !this.isCollapsed
        }
        
        this.requestUpdate()
    }


    minimize () {
        if (this.isCollapsed) {
            this.isCollapsed = false
            this.requestUpdate()
            return
        }
        
        this.isMinimized = !this.isMinimized
        
        if (!this.isMinimized) {
            this.isCollapsed = false
        }
        
        this.requestUpdate()
    }


    handleClear (event) {
        event.stopPropagation()
        this.clear()
    }


    handleMinimize (event) {
        event.stopPropagation()
        this.minimize()
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


customElements.define('perky-logger', PerkyLogger)
