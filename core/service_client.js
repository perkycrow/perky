import ServiceTransport from './service_transport'
import ServiceRequest from './service_request'


export default class ServiceClient {

    constructor ({transport, target} = {}) {

        if (transport) {
            this.transport = transport
        } else if (target) {
            this.transport = ServiceTransport.auto(target)
        } else {
            this.transport = ServiceTransport.auto()
        }

        this.pendingRequests = new Map()
        this.transport.onMessage(this.handleMessage.bind(this))
    }


    async request (action, params = {}, timeout = 5000) {
        const request = new ServiceRequest(action, params)
    
        return new Promise((resolve, reject) => {
            this.pendingRequests.set(request.id, {resolve, reject})

            const timeoutId = setTimeout(() => {
                this.pendingRequests.delete(request.id)
                reject(new Error(`Request timeout for action '${action}'`))
            }, timeout)

            const originalResolve = this.pendingRequests.get(request.id).resolve
            const originalReject = this.pendingRequests.get(request.id).reject

            this.pendingRequests.set(request.id, {
                resolve: (value) => {
                    clearTimeout(timeoutId)
                    this.pendingRequests.delete(request.id)
                    originalResolve(value)
                },
                reject: (error) => {
                    clearTimeout(timeoutId)
                    this.pendingRequests.delete(request.id)
                    originalReject(error)
                }
            })

            this.transport.send({
                type: 'service-request',
                request: request.toJSON()
            })
        })
    }


    handleMessage (message) {
        if (message.type !== 'service-response') {
            return
        }

        const response = message.response
        const pending = this.pendingRequests.get(response.requestId)

        if (!pending) {
            return
        }

        if (response.success) {
            pending.resolve(response.data)
        } else {
            pending.reject(new Error(response.error))
        }
    }

}
