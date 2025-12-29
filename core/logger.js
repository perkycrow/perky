import Notifier from './notifier.js'


class Logger extends Notifier {

    #history = []
    #maxHistory = 100


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
