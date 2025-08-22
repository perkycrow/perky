import ServiceHost from './service_host'
import ServiceTransport from './service_transport'
import ServiceRequest from './service_request'
import ServiceResponse from './service_response'
import {vi} from 'vitest'


describe(ServiceHost, () => {

    let transport
    let host

    beforeEach(() => {
        transport = ServiceTransport.local()
        host = new ServiceHost({transport})
    })


    test('constructor with transport', () => {
        expect(host.transport).toBe(transport)
        expect(host.actions).toBeInstanceOf(Map)
        expect(host.actions.size).toBe(0)
    })


    test('constructor with target', () => {
        const target = {
            postMessage: vi.fn(),
            onmessage: null
        }
        
        const hostWithTarget = new ServiceHost({target})
        
        expect(hostWithTarget.transport).toBeInstanceOf(ServiceTransport)
        expect(hostWithTarget.actions).toBeInstanceOf(Map)
    })


    test('constructor with no parameters uses auto transport', () => {
        const hostAuto = new ServiceHost()
        
        expect(hostAuto.transport).toBeInstanceOf(ServiceTransport)
        expect(hostAuto.actions).toBeInstanceOf(Map)
    })


    test('register action', () => {
        const handler = vi.fn()
        
        const result = host.register('testAction', handler)
        
        expect(result).toBe(host)
        expect(host.actions.get('testAction')).toBe(handler)
    })


    test('unregister action', () => {
        const handler = vi.fn()
        
        host.register('testAction', handler)
        expect(host.actions.has('testAction')).toBe(true)
        
        const result = host.unregister('testAction')
        
        expect(result).toBe(host)
        expect(host.actions.has('testAction')).toBe(false)
    })


    test('handleMessage ignores non-service-request messages', () => {
        const handler = vi.fn()
        host.register('testAction', handler)
        
        host.handleMessage({type: 'other-message'})
        host.handleMessage({type: 'service-response'})
        
        expect(handler).not.toHaveBeenCalled()
    })


    test('handleMessage with valid service request', () => {
        const handler = vi.fn()
        const sendSpy = vi.spyOn(host, 'sendResponse')
        
        host.register('testAction', handler)
        
        const request = new ServiceRequest('testAction', {param1: 'value1'})
        const message = {
            type: 'service-request',
            request: request.toJSON()
        }
        
        host.handleMessage(message)
        
        expect(handler).toHaveBeenCalledWith(
            {
                id: request.id,
                action: 'testAction',
                params: {param1: 'value1'},
                timestamp: request.timestamp
            },
            expect.objectContaining({
                send: expect.any(Function),
                error: expect.any(Function)
            })
        )
        
        sendSpy.mockRestore()
    })


    test('handleMessage with unknown action', () => {
        const sendSpy = vi.spyOn(host, 'sendResponse')
        
        const request = new ServiceRequest('unknownAction')
        const message = {
            type: 'service-request',
            request: request.toJSON()
        }
        
        host.handleMessage(message)
        
        expect(sendSpy).toHaveBeenCalledWith(
            expect.objectContaining({
                requestId: request.id,
                success: false,
                error: "Action 'unknownAction' not found"
            })
        )
        
        sendSpy.mockRestore()
    })


    test('action handler success response', () => {
        const sendSpy = vi.spyOn(host, 'sendResponse')
        
        host.register('testAction', (req, res) => {
            res.send({result: 'success', data: req.params.input})
        })
        
        const request = new ServiceRequest('testAction', {input: 'test data'})
        const message = {
            type: 'service-request',
            request: request.toJSON()
        }
        
        host.handleMessage(message)
        
        expect(sendSpy).toHaveBeenCalledWith(
            expect.objectContaining({
                requestId: request.id,
                success: true,
                data: {result: 'success', data: 'test data'}
            })
        )
        
        sendSpy.mockRestore()
    })


    test('action handler error response', () => {
        const sendSpy = vi.spyOn(host, 'sendResponse')
        
        host.register('testAction', (req, res) => {
            res.error('Something went wrong')
        })
        
        const request = new ServiceRequest('testAction')
        const message = {
            type: 'service-request',
            request: request.toJSON()
        }
        
        host.handleMessage(message)
        
        expect(sendSpy).toHaveBeenCalledWith(
            expect.objectContaining({
                requestId: request.id,
                success: false,
                error: 'Something went wrong'
            })
        )
        
        sendSpy.mockRestore()
    })


    test('action handler exception handling', () => {
        const sendSpy = vi.spyOn(host, 'sendResponse')
        
        host.register('testAction', () => {
            throw new Error('Handler crashed')
        })
        
        const request = new ServiceRequest('testAction')
        const message = {
            type: 'service-request',
            request: request.toJSON()
        }
        
        host.handleMessage(message)
        
        expect(sendSpy).toHaveBeenCalledWith(
            expect.objectContaining({
                requestId: request.id,
                success: false,
                error: 'Handler crashed'
            })
        )
        
        sendSpy.mockRestore()
    })


    test('sendResponse', () => {
        const transportSpy = vi.spyOn(transport, 'send')
        const response = new ServiceResponse('test-request-id')
        response.send({result: 'test'})
        
        host.sendResponse(response)
        
        expect(transportSpy).toHaveBeenCalledWith({
            type: 'service-response',
            response: response.toJSON()
        })
        
        transportSpy.mockRestore()
    })


    test('full request-response cycle', () => {
        const [transportA, transportB] = ServiceTransport.pair()
        const hostA = new ServiceHost({transport: transportA})
        
        hostA.register('echo', (req, res) => {
            res.send({echo: req.params.message})
        })
        
        const responseHandler = vi.fn()
        transportB.onMessage(responseHandler)
        
        const request = new ServiceRequest('echo', {message: 'hello world'})
        const message = {
            type: 'service-request',
            request: request.toJSON()
        }
        
        transportB.send(message)
        
        expect(responseHandler).toHaveBeenCalledWith({
            type: 'service-response',
            response: expect.objectContaining({
                requestId: request.id,
                success: true,
                data: {echo: 'hello world'}
            })
        })
    })


    test('multiple action registrations', () => {
        const handler1 = vi.fn((req, res) => res.send('result1'))
        const handler2 = vi.fn((req, res) => res.send('result2'))
        
        host.register('action1', handler1)
        host.register('action2', handler2)
        
        expect(host.actions.size).toBe(2)
        expect(host.actions.get('action1')).toBe(handler1)
        expect(host.actions.get('action2')).toBe(handler2)
    })


    test('overwrite action registration', () => {
        const handler1 = vi.fn()
        const handler2 = vi.fn()
        
        host.register('testAction', handler1)
        host.register('testAction', handler2)
        
        expect(host.actions.size).toBe(1)
        expect(host.actions.get('testAction')).toBe(handler2)
    })


    test('inherits from Notifier', () => {
        expect(typeof host.on).toBe('function')
        expect(typeof host.emit).toBe('function')
        expect(typeof host.off).toBe('function')
    })


    test('emitToClient sends service-event message', () => {
        const transportSpy = vi.spyOn(transport, 'send')
        
        host.emitToClient('testEvent', 'arg1', 'arg2', 42)
        
        expect(transportSpy).toHaveBeenCalledWith({
            type: 'service-event',
            eventName: 'testEvent',
            args: ['arg1', 'arg2', 42],
            direction: 'host-to-client'
        })
        
        transportSpy.mockRestore()
    })


    test('handleEvent from client triggers local event with prefix', () => {
        const eventHandler = vi.fn()
        host.on('client:testEvent', eventHandler)
        
        const message = {
            type: 'service-event',
            eventName: 'testEvent',
            args: ['hello', 'world'],
            direction: 'client-to-host'
        }
        
        host.handleMessage(message)
        
        expect(eventHandler).toHaveBeenCalledWith('hello', 'world')
    })


    test('handleEvent ignores wrong direction', () => {
        const eventHandler = vi.fn()
        host.on('client:testEvent', eventHandler)
        
        const message = {
            type: 'service-event',
            eventName: 'testEvent',
            args: ['hello', 'world'],
            direction: 'host-to-client'
        }
        
        host.handleMessage(message)
        
        expect(eventHandler).not.toHaveBeenCalled()
    })


    test('event communication with client', () => {
        const [transportA, transportB] = ServiceTransport.pair()
        const hostA = new ServiceHost({transport: transportA})
        
        const clientEventHandler = vi.fn()
        transportB.onMessage((message) => {
            if (message.type === 'service-event' && message.direction === 'host-to-client') {
                clientEventHandler(message.eventName, ...message.args)
            }
        })
        
        hostA.emitToClient('dataUpdate', {id: 1, name: 'test'})
        
        expect(clientEventHandler).toHaveBeenCalledWith('dataUpdate', {id: 1, name: 'test'})
    })

})
