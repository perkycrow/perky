import Notifier from './notifier'


export default class PerkyModule extends Notifier {

    constructor () {
        super()
        reset(this)
        this.init()
    }


    get running () {
        return this.initialized && this.started
    }


    init () {
        if (this.initialized) {
            return false
        }

        this.initialized = true
        this.emit('init')

        return true
    }


    start () {
        if (!this.initialized || this.started) {
            return false
        }

        this.started = true
        this.emit('start')

        return true
    }


    stop () {
        if (!this.initialized || !this.started) {
            return false
        }

        this.started = false
        this.emit('stop')

        return true
    }


    dispose () {
        if (!this.initialized) {
            return false
        }

        this.stop()
        this.emit('dispose')
        this.removeListeners()
        reset(this)

        return true
    }

}


function reset (module) {
    module.started = false
    module.initialized = false
}