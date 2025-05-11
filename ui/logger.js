import Application from '../application/application'

const baseHtml = `
    <div class="perky-logger perky-logger-light">
        <div class="perky-logger-header">
            <span class="perky-logger-title">Logger</span>
            <button class="perky-logger-clear">Clear</button>
            <button class="perky-logger-toggle">-</button>
        </div>
        <div class="perky-logger-content"></div>
    </div>
`

const baseCss = `
    .perky-logger {
        width: calc(100% - 20px);
        max-height: 200px;
        border-radius: 6px;
        overflow: hidden;
        z-index: 100;
        font-family: 'IBM Plex Mono', monospace;
        font-size: 12px;
        transition: all 0.3s ease;
    }

    .perky-logger-dark {
        background: rgba(40, 44, 52, 0.85);
        backdrop-filter: blur(5px);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        color: #fff;
    }

    .perky-logger-light {
        background: rgba(255, 255, 255, 0.85);
        backdrop-filter: blur(5px);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        border: 1px solid rgba(0, 0, 0, 0.1);
        color: #333;
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
    }

    .perky-logger-dark .perky-logger-header {
        background: rgba(255, 255, 255, 0.1);
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .perky-logger-light .perky-logger-header {
        background: rgba(0, 0, 0, 0.05);
        border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    }

    .perky-logger-title {
        flex-grow: 1;
        font-weight: 500;
    }

    .perky-logger-toggle,
    .perky-logger-clear {
        background: none;
        border: none;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        border-radius: 3px;
        margin-left: 4px;
        transition: background 0.2s ease;
    }

    .perky-logger-dark .perky-logger-toggle,
    .perky-logger-dark .perky-logger-clear {
        color: #fff;
    }

    .perky-logger-light .perky-logger-toggle,
    .perky-logger-light .perky-logger-clear {
        color: #333;
    }

    .perky-logger-dark .perky-logger-toggle:hover,
    .perky-logger-dark .perky-logger-clear:hover {
        background: rgba(255, 255, 255, 0.2);
    }

    .perky-logger-light .perky-logger-toggle:hover,
    .perky-logger-light .perky-logger-clear:hover {
        background: rgba(0, 0, 0, 0.1);
    }

    .perky-logger-content {
        max-height: 160px;
        overflow-y: auto;
        padding: 8px 0;
    }

    .perky-logger-entry {
        padding: 4px 12px;
        display: flex;
        align-items: baseline;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }

    .perky-logger-light .perky-logger-entry {
        border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    }

    .perky-logger-entry:last-child {
        border-bottom: none;
    }

    .perky-logger-timestamp {
        color: rgba(255, 255, 255, 0.5);
        margin-right: 8px;
        font-size: 11px;
        min-width: 70px;
    }

    .perky-logger-light .perky-logger-timestamp {
        color: rgba(0, 0, 0, 0.5);
    }

    .perky-logger-message {
        flex-grow: 1;
        word-break: break-word;
    }

    .perky-logger-info {
        color: #8bc8f7;
    }

    .perky-logger-light .perky-logger-info {
        color: #0366d6;
    }

    .perky-logger-warn {
        color: #e2c08d;
    }

    .perky-logger-light .perky-logger-warn {
        color: #b08800;
    }

    .perky-logger-error {
        color: #f97583;
    }

    .perky-logger-light .perky-logger-error {
        color: #d73a49;
    }

    .perky-logger-success {
        color: #85e89d;
    }

    .perky-logger-light .perky-logger-success {
        color: #22863a;
    }
`


export default class Logger extends Application {

    constructor (params = {}) {
        super(params)

        this.setHtml(baseHtml)
        this.setCss(baseCss)

        this.options = {
            maxEntries: 50,
            position: 'bottom',
            timestamp: false,
            collapsible: true,
            ...params.options
        }

        this.entries = []

        this.loggerElement = this.element.querySelector('.perky-logger')
        this.loggerElement.classList.add(`perky-logger-${this.options.position}`)

        initEvents(this)
    }


    log (message, type = 'info') {
        const entry = document.createElement('div')
        entry.className = `perky-logger-entry perky-logger-${type}`

        if (this.options.timestamp) {
            const timestamp = document.createElement('span')
            timestamp.className = 'perky-logger-timestamp'
            timestamp.textContent = new Date().toLocaleTimeString()
            entry.appendChild(timestamp)
        }

        const messageElement = document.createElement('span')
        messageElement.className = 'perky-logger-message'
        messageElement.textContent = message
        entry.appendChild(messageElement)

        this.element.querySelector('.perky-logger-content').appendChild(entry)
        this.element.querySelector('.perky-logger-content').scrollTop = this.element.querySelector('.perky-logger-content').scrollHeight

        this.entries.push(entry)

        while (this.entries.length > this.options.maxEntries) {
            const oldestEntry = this.entries.shift()
            if (oldestEntry.parentNode) {
                oldestEntry.parentNode.removeChild(oldestEntry)
            }
        }

        return entry
    }


    info (message) {
        return this.log(message, 'info')
    }


    warn (message) {
        return this.log(message, 'warn')
    }


    error (message) {
        return this.log(message, 'error')
    }


    success (message) {
        return this.log(message, 'success')
    }


    clear () {
        this.entries = []
        while (this.element.querySelector('.perky-logger-content').firstChild) {
            this.element.querySelector('.perky-logger-content').removeChild(this.element.querySelector('.perky-logger-content').firstChild)
        }
    }


    toggle () {
        if (this.options.collapsible) {
            const isVisible = this.element.querySelector('.perky-logger-content').style.display !== 'none'
            this.element.querySelector('.perky-logger-content').style.display = isVisible ? 'none' : 'block'
            this.element.querySelector('.perky-logger-toggle').innerHTML = isVisible ? '+' : '−'
        }
    }


    remove () {
        this.element.remove()
    }

}


function initEvents (app) {
    const toggleButton = app.element.querySelector('.perky-logger-toggle')

    toggleButton.addEventListener('click', () => {
        app.toggle()
    })

    const clearButton = app.element.querySelector('.perky-logger-clear')
    clearButton.addEventListener('click', (e) => {
        e.stopPropagation()
        app.clear()
    })

    app.element.querySelector('.perky-logger-header').addEventListener('click', () => {
        app.toggle()
    })
}

