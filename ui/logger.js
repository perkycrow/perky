import PerkyView from '../application/perky_view'

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



export default class Logger extends PerkyView {

    constructor (params = {}) {
        super({
            className: 'perky-logger-container',
            ...params
        })

        this.html = baseHtml

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