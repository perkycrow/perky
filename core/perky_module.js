import Notifier from './notifier'


export default class PerkyModule extends Notifier {

    constructor () {
        super()
        this.started = false
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
        if (this.disposed) {
            return false
        }

        this.disposed = true
        this.stop()
        this.emit('dispose')
        this.removeListeners()

        return true
    }

}
