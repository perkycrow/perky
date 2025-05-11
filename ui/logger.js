import Application from '../application/application'

const baseHtml = `
    <div class="perky-logger perky-logger-light">
        <div class="perky-logger-header">
            <span class="perky-logger-title">Logger</span>
            <div class="perky-logger-buttons">
                <button class="perky-logger-clear">Clear</button>
                <button class="perky-logger-minimize">-</button>
            </div>
        </div>
        <div class="perky-logger-content"></div>
        <div class="perky-logger-mini-icon" style="display: none;">📋</div>
    </div>
`

const baseCss = `
    .perky-logger {
        width: calc(100% - 20px);
        border-radius: 6px;
        overflow: hidden;
        z-index: 100;
        font-family: 'IBM Plex Mono', monospace;
        font-size: 12px;
        transition: all 0.3s ease;
        position: relative;
    }

    .perky-logger-light {
        background: rgba(255, 255, 255, 0.85);
        backdrop-filter: blur(5px);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        border: 1px solid rgba(0, 0, 0, 0.1);
        color: #333;
    }

    .perky-logger-minimized {
        width: 36px;
        height: 36px;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        position: absolute;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    }

    .perky-logger-minimized.perky-logger-light {
        background: rgba(255, 255, 255, 0.85);
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

    .perky-logger-mini-icon {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
    }

    .perky-logger-buttons {
        display: flex;
        align-items: center;
        gap: 4px;
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
    }

    .perky-logger-light .perky-logger-header {
        background: rgba(0, 0, 0, 0.05);
        border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    }

    .perky-logger-title {
        flex-grow: 1;
        font-weight: 500;
    }

    .perky-logger-minimize,
    .perky-logger-clear {
        background: none;
        border: none;
        min-width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        border-radius: 3px;
        margin-left: 4px;
        transition: background 0.2s ease;
    }

    .perky-logger-light .perky-logger-minimize,
    .perky-logger-light .perky-logger-clear {
        color: #333;
    }

    .perky-logger-light .perky-logger-minimize:hover,
    .perky-logger-light .perky-logger-clear:hover {
        background: rgba(0, 0, 0, 0.1);
    }

    .perky-logger-content {
        max-height: 250px;
        overflow-y: auto;
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

    .perky-logger-spacer {
        height: 1px;
        background-color: rgba(0, 0, 0, 0.05);
    }

    .perky-logger-title {
        font-weight: 500;
        font-size: 14px;
        color: #333;
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
        this.loggerHeader = this.element.querySelector('.perky-logger-header')
        this.loggerContent = this.element.querySelector('.perky-logger-content')
        this.miniIcon = this.element.querySelector('.perky-logger-mini-icon')
        this.minimizeButton = this.element.querySelector('.perky-logger-minimize')
        this.clearButton = this.element.querySelector('.perky-logger-clear')
        
        this.loggerElement.classList.add(`perky-logger-${this.options.position}`)
        
        this.isMinimized = false
        this.isCollapsed = false

        initEvents(this)
    }


    log (message, type = 'info', format = 'text') {
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

        processMessage(messageElement, message, format)

        entry.appendChild(messageElement)

        this.loggerContent.appendChild(entry)
        this.loggerContent.scrollTop = this.loggerContent.scrollHeight

        this.entries.push(entry)

        while (this.entries.length > this.options.maxEntries) {
            const oldestEntry = this.entries.shift()
            if (oldestEntry.parentNode) {
                oldestEntry.parentNode.removeChild(oldestEntry)
            }
        }

        return entry
    }


    info (...messages) {
        return this.log(formatMessage(...messages), 'info')
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
        this.loggerContent.appendChild(entry)
        this.entries.push(entry)
    }


    title (title) {
        const entry = document.createElement('div')
        entry.className = 'perky-logger-entry perky-logger-title'
        entry.textContent = title
        this.loggerContent.appendChild(entry)
        this.entries.push(entry)
    }


    clear () {
        this.entries = []
        while (this.loggerContent.firstChild) {
            this.loggerContent.removeChild(this.loggerContent.firstChild)
        }
    }


    toggle () {
        if (this.options.collapsible) {
            if (this.isMinimized) {
                this.isMinimized = false
                this.isCollapsed = false
                this.loggerHeader.style.display = 'flex'
                this.loggerContent.style.display = 'block'
                this.miniIcon.style.display = 'none'
                this.loggerElement.classList.remove('perky-logger-minimized')
                this.minimizeButton.innerHTML = '-'
            } else {
                this.isCollapsed = !this.isCollapsed
                this.loggerContent.style.display = this.isCollapsed ? 'none' : 'block'
                this.minimizeButton.innerHTML = this.isCollapsed ? '+' : '-'
            }
        }
    }


    minimize () {
        if (this.isCollapsed) {
            this.isCollapsed = false
            this.loggerContent.style.display = 'block'
            this.minimizeButton.innerHTML = '-'
            return
        }
        
        if (this.isMinimized) {
            this.isMinimized = false
            this.isCollapsed = false
            this.loggerHeader.style.display = 'flex'
            this.loggerContent.style.display = 'block'
            this.miniIcon.style.display = 'none'
            this.loggerElement.classList.remove('perky-logger-minimized')
            this.minimizeButton.innerHTML = '-'
        } else {
            this.isMinimized = true
            this.loggerHeader.style.display = 'none'
            this.loggerContent.style.display = 'none'
            this.miniIcon.style.display = 'flex'
            this.loggerElement.classList.add('perky-logger-minimized')
            
            if (this.options.position === 'bottom' || this.options.position === 'top') {
                this.loggerElement.classList.add(`perky-logger-${this.options.position}`)
            }
        }
    }


    remove () {
        this.element.remove()
    }

}


function initEvents (app) {
    app.minimizeButton.addEventListener('click', (e) => {
        e.stopPropagation()
        app.minimize()
    })
    
    app.miniIcon.addEventListener('click', () => {
        app.toggle()
    })

    app.clearButton.addEventListener('click', (e) => {
        e.stopPropagation()
        app.clear()
    })

    app.loggerHeader.addEventListener('click', () => {
        app.toggle()
    })
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