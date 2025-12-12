export default class ServiceTransport {

    constructor (config) {
        this.sendFn = config.send
        this.messageHandlers = new Set()

        if (config.receive) {
            config.receive(this.handleMessage.bind(this))
        }
    }


    send (message) {
        this.sendFn(message)
    }


    onMessage (handler) {
        this.messageHandlers.add(handler)
    }


    offMessage (handler) {
        this.messageHandlers.delete(handler)
    }


    handleMessage (message) {
        this.messageHandlers.forEach(handler => handler(message))
    }


    static create (config) {
        return new ServiceTransport(config)
    }


    static auto (target) {
        if (target && typeof target.postMessage === 'function' && typeof target.onmessage !== 'undefined') {
            return new ServiceTransport({
                send: (message) => target.postMessage(message),
                receive: (handler) => {
                    target.onmessage = (e) => handler(e.data)
                }
            })
        }

        if (typeof self !== 'undefined' && typeof self.postMessage === 'function') {
            return new ServiceTransport({
                send: (message) => self.postMessage(message),
                receive: (handler) => {
                    self.onmessage = (e) => handler(e.data)
                }
            })
        }

        return ServiceTransport.local()
    }


    static worker (worker) {
        return new ServiceTransport({
            send: (message) => worker.postMessage(message),
            receive: (handler) => {
                worker.onmessage = (e) => handler(e.data)
            }
        })
    }


    static main () {
        return new ServiceTransport({
            send: (message) => self.postMessage(message),
            receive: (handler) => {
                self.onmessage = (e) => handler(e.data)
            }
        })
    }


    static local () {
        const handlers = []
        return new ServiceTransport({
            send: (message) => handlers.forEach(h => h(message)),
            receive: (handler) => handlers.push(handler)
        })
    }


    static channel (port) {
        return new ServiceTransport({
            send: (message) => port.postMessage(message),
            receive: (handler) => {
                port.onmessage = (e) => handler(e.data)
            }
        })
    }


    static pair () {
        const handlersA = []
        const handlersB = []

        const transportA = new ServiceTransport({
            send: (message) => handlersB.forEach(h => h(message)),
            receive: (handler) => handlersA.push(handler)
        })

        const transportB = new ServiceTransport({
            send: (message) => handlersA.forEach(h => h(message)),
            receive: (handler) => handlersB.push(handler)
        })

        return [transportA, transportB]
    }

}
