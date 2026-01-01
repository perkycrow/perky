import ServiceTransport from './service_transport.js'
import ServiceRequest from './service_request.js'
import ServiceResponse from './service_response.js'
import PerkyModule from '../core/perky_module.js'


export default class ServiceHost extends PerkyModule {

    static $category = 'serviceHost'

    static $eagerStart = false


    constructor ({transport, target, ...options} = {}) {
        super(options)

        if (transport) {
            this.transport = transport
        } else if (target) {
            this.transport = ServiceTransport.auto(target)
        } else {
            this.transport = ServiceTransport.auto()
        }

        this.actions = new Map()
        this.transport.onMessage(this.handleMessage.bind(this))

        if (this.constructor.serviceMethods && Array.isArray(this.constructor.serviceMethods)) {
            this.constructor.serviceMethods.forEach(methodName => {
                this.registerMethod(methodName)
            })
        }
    }


    register (action, handler) {
        this.actions.set(action, handler)
        return this
    }


    registerMethod (methodName) {
        if (typeof this[methodName] !== 'function') {
            throw new Error(`Method '${methodName}' not found on service`)
        }

        this.actions.set(methodName, this[methodName].bind(this))
        return this
    }


    unregister (action) {
        this.actions.delete(action)
        return this
    }


    handleMessage (message) {
        if (message.type === 'service-event') {
            this.handleEvent(message)
            return
        }

        if (message.type !== 'service-request') {
            return
        }

        const request = ServiceRequest.import(message.request)
        const response = new ServiceResponse(request.id)

        if (!this.actions.has(request.action)) {
            response.fail(`Action '${request.action}' not found`)
            this.sendResponse(response)
            return
        }

        try {
            const req = {
                id: request.id,
                action: request.action,
                params: request.params,
                timestamp: request.timestamp
            }

            const res = {
                send: (data) => {
                    response.send(data)
                    this.sendResponse(response)
                },
                error: (error) => {
                    response.fail(error)
                    this.sendResponse(response)
                }
            }

            this.actions.get(request.action)(req, res)
        } catch (error) {
            response.fail(error.message)
            this.sendResponse(response)
        }
    }


    handleEvent (message) {
        const {eventName, args, direction} = message

        if (direction === 'client-to-host') {
            this.emit(`client:${eventName}`, ...args)
        }
    }


    sendResponse (response) {
        this.transport.send({
            type: 'service-response',
            response: response.export()
        })
    }


    emitToClient (eventName, ...args) {
        this.transport.send({
            type: 'service-event',
            eventName,
            args,
            direction: 'host-to-client'
        })
    }

}
