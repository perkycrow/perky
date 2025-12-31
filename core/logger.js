import Notifier from './notifier.js'


const CONSOLE_METHODS = {
    info: 'info',
    warn: 'warn',
    error: 'error',
    notice: 'log',
    success: 'log'
}


class Logger extends Notifier {

    #history = []
    #maxHistory = 100
    #consoleOutput = true


    get history () {
        return this.#history
    }


    get maxHistory () {
        return this.#maxHistory
    }


    set maxHistory (value) {
        this.#maxHistory = value
        this.#trimHistory()
    }


    get consoleOutput () {
        return this.#consoleOutput
    }


    set consoleOutput (value) {
        this.#consoleOutput = value
    }


    #record (entry) {
        this.#history.push(entry)
        this.#trimHistory()
    }


    #trimHistory () {
        while (this.#history.length > this.#maxHistory) {
            this.#history.shift()
        }
    }


    log (type, ...items) {
        const entry = {event: 'log', type, items, timestamp: Date.now()}
        this.#record(entry)
        this.emit('log', entry)

        if (this.#consoleOutput) {
            const method = CONSOLE_METHODS[type] || 'log'
            console[method](...items)
        }
    }


    info (...items) {
        this.log('info', ...items)
    }


    notice (...items) {
        this.log('notice', ...items)
    }


    warn (...items) {
        this.log('warn', ...items)
    }


    error (...items) {
        this.log('error', ...items)
    }


    success (...items) {
        this.log('success', ...items)
    }


    clear () {
        const entry = {event: 'clear', timestamp: Date.now()}
        this.#record(entry)
        this.emit('clear', entry)
    }


    spacer () {
        const entry = {event: 'spacer', timestamp: Date.now()}
        this.#record(entry)
        this.emit('spacer', entry)
    }


    title (title) {
        const entry = {event: 'title', title, timestamp: Date.now()}
        this.#record(entry)
        this.emit('title', entry)
    }


    clearHistory () {
        this.#history = []
    }

}


export default new Logger()
