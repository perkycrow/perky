import Notifier from './notifier.js'


export default class WorkerHost extends Notifier {

    constructor () {
        super()
        this.setupMessageListener()
    }

    setupMessageListener () {
        self.onmessage = (event) => {
            const { action, data } = event.data
            this.emit(action, data)
        }
    }

    send (action, data) {
        self.postMessage({ action, data })
    }

}
