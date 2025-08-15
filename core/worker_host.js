import Notifier from './notifier.js'


export default class WorkerHost extends Notifier {

    constructor () {
        super()
        this.setupMessageListener()
    }

    setupMessageListener () {
        self.onmessage = (event) => {
            const {action, data, requestId} = event.data
            
            if (requestId) {
                this.emit(action, data, requestId)
            } else {
                this.emit(action, data)
            }
        }
    }

    send (action, data) {
        self.postMessage({action, data})
    }

    reply (action, data, requestId) {
        self.postMessage({action, data, requestId})
    }

}
