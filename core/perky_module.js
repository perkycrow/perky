import Notifier from './notifier'


export default class PerkyModule extends Notifier {

    constructor () {
        super()
        reset(this)
    }


    get running () {
        return this.initialized && this.started && !this.paused
    }


    init (...args) {
        if (this.initialized) {
            return false
        }

        this.initialized = true
        this.emit('init', ...args)

        return true
    }


    update (...args) {
        if (!this.running) {
            return false
        }

        this.emit('update', ...args)

        return true
    }


    start (...args) {
        if (!this.initialized || this.started) {
            return false
        }

        this.paused = false
        this.started = true
        this.emit('start', ...args)

        return true
    }


    stop (...args) {
        if (!this.initialized || !this.started) {
            return false
        }

        this.started = false
        this.emit('stop', ...args)

        return true
    }


    pause (...args) {
        if (!this.running) {
            return false
        }

        this.paused = true
        this.emit('pause', ...args)

        return true
    }


    resume (...args) {
        if (!this.initialized || !this.started || !this.paused) {
            return false
        }

        this.paused = false
        this.emit('resume', ...args)

        return true
    }


    dispose (...args) {
        if (!this.initialized) {
            return false
        }

        this.stop()
        this.emit('dispose', ...args)
        this.removeListeners()
        reset(this)

        return true
    }

}


function reset (module) {
    module.started = false
    module.initialized = false
    module.paused = false
}
