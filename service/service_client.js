import ServiceTransport from './service_transport'
import ServiceRequest from './service_request'
import Notifier from '../core/notifier'


export default class ServiceClient extends Notifier {

    constructor ({transport, target} = {}) {
        super()

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
                request: request.export()
            })
        })
    }


    handleMessage (message) {
        if (message.type === 'service-event') {
            this.handleEvent(message)
            return
        }

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


    handleEvent (message) {
        const {eventName, args, direction} = message
        
        if (direction === 'host-to-client') {
            this.emit(`host:${eventName}`, ...args)
        }
    }


    emitToHost (eventName, ...args) {
        this.transport.send({
            type: 'service-event',
            eventName,
            args,
            direction: 'client-to-host'
        })
    }


    static fromWorker (servicePath, config = {}) {
        const workerUrl = new URL('./service_worker.js', import.meta.url)
        const worker = new Worker(workerUrl, {type: 'module'})
        const client = new ServiceClient({target: worker})
        
        worker.postMessage({
            type: 'init-service',
            servicePath,
            config
        })
        
        return client
    }


    static async fromService (ServiceClass, config = {}) {
        const [transportA, transportB] = ServiceTransport.pair()
        
        const host = new ServiceClass({...config, transport: transportA})
        const client = new ServiceClient({transport: transportB})
        
        client.host = host
        return client
    }


    static async fromPath (servicePath, config = {}) {
        const module = await import(/* @vite-ignore */ servicePath)
        
        const ServiceClass = module.default || Object.values(module).find(value => {
            return typeof value === 'function' && value.prototype
        })

        return ServiceClient.fromService(ServiceClass, config)
    }


    static from (options) {
        const {worker, service, path, config = {}} = options
        
        const optionCount = [worker, service, path].filter(Boolean).length
        
        if (optionCount === 0) {
            throw new Error('ServiceClient.from() requires one of: worker, service, or path')
        }
        
        if (optionCount > 1) {
            throw new Error('ServiceClient.from() requires exactly one option: worker, service, or path')
        }
        
        if (worker) {
            return ServiceClient.fromWorker(worker, config)
        }
        
        if (service) {
            return ServiceClient.fromService(service, config)
        }
        
        return ServiceClient.fromPath(path, config)
    }

}
