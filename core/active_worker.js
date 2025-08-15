import Notifier from './notifier.js'


export default class ActiveWorker extends Notifier {

    constructor (workerPath) {
        super()
        this.workerPath = workerPath
        this.worker = null
        this.isStarted = false
    }

    start () {
        if (this.isStarted) {
            return this
        }

        this.worker = new Worker(this.workerPath, { type: 'module' })
        this.setupMessageListener()
        this.isStarted = true

        return this
    }

    stop () {
        if (this.worker) {
            this.worker.terminate()
            this.worker = null
        }
        this.isStarted = false

        return this
    }

    restart () {
        this.stop()
        this.start()

        return this
    }

    setupMessageListener () {
        if (!this.worker) return

        this.worker.onmessage = (event) => {
            const { action, data } = event.data
            this.emit(action, data)
        }

        this.worker.onerror = (error) => {
            this.emit('error', error)
        }
    }

    send (action, data) {
        if (!this.worker || !this.isStarted) {
            throw new Error('Worker not started')
        }

        this.worker.postMessage({ action, data })

        return this
    }

}
