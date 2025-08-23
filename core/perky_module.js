import Notifier from './notifier'


export default class PerkyModule extends Notifier {

    constructor () {
        super()
        reset(this)
    }


    get running () {
        return this.started
    }


    start () {
        if (this.started) {
            return false
        }

        this.started = true
        this.emit('start')

        return true
    }


    stop () {
        if (!this.started) {
            return false
        }

        this.started = false
        this.emit('stop')

        return true
    }


    dispose () {
        this.stop()
        this.emit('dispose')
        this.removeListeners()
        reset(this)

        return true
    }

}


function reset (module) {
    module.started = false
}