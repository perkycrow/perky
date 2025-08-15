import Notifier from './notifier.js'


export default class ActiveWorker extends Notifier {

    constructor (workerPath, options = {}) {
        super()
        this.workerPath = workerPath
        this.worker = null
        this.isStarted = false
        this.defaultTimeout = options.defaultTimeout || 5000
        this.pendingRequests = new Map()
        this.requestIdCounter = 0
    }

    start () {
        if (this.isStarted) {
            return this
        }

        this.worker = new Worker(this.workerPath, {type: 'module'})
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
        if (!this.worker) {
            return
        }

        this.worker.onmessage = (event) => {
            const {action, data, requestId} = event.data

            if (requestId && this.pendingRequests.has(requestId)) {
                const {resolve} = this.pendingRequests.get(requestId)
                this.pendingRequests.delete(requestId)
                resolve(data)
            } else {
                this.emit(action, data)
            }
        }

        this.worker.onerror = (error) => {
            this.emit('error', error)
        }
    }

    send (action, data) {
        if (!this.worker || !this.isStarted) {
            throw new Error('Worker not started')
        }

        this.worker.postMessage({action, data})

        return this
    }

    generateRequestId () {
        return `req_${++this.requestIdCounter}_${Date.now()}`
    }

    request (action, data, timeout = this.defaultTimeout) {
        if (!this.worker || !this.isStarted) {
            return Promise.reject(new Error('Worker not started'))
        }

        return new Promise((resolve, reject) => {
            const requestId = this.generateRequestId()

            this.pendingRequests.set(requestId, {resolve, reject})

            if (timeout > 0) {
                setTimeout(() => {
                    if (this.pendingRequests.has(requestId)) {
                        this.pendingRequests.delete(requestId)
                        reject(new Error(`Request timeout after ${timeout}ms`))
                    }
                }, timeout)
            }

            this.worker.postMessage({action, data, requestId})
        })
    }

}
