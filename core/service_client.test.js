import ServiceClient from './service_client'
import ServiceHost from './service_host'
import ServiceTransport from './service_transport'
import {vi} from 'vitest'


describe(ServiceClient, () => {

    let transport
    let client

    beforeEach(() => {
        transport = ServiceTransport.local()
        client = new ServiceClient({transport})
    })


    test('constructor with transport', () => {
        expect(client.transport).toBe(transport)
        expect(client.pendingRequests).toBeInstanceOf(Map)
        expect(client.pendingRequests.size).toBe(0)
    })


    test('constructor with target', () => {
        const target = {
            postMessage: vi.fn(),
            onmessage: null
        }
        
        const clientWithTarget = new ServiceClient({target})
        
        expect(clientWithTarget.transport).toBeInstanceOf(ServiceTransport)
        expect(clientWithTarget.pendingRequests).toBeInstanceOf(Map)
    })


    test('constructor with no parameters uses auto transport', () => {
        const clientAuto = new ServiceClient()
        
        expect(clientAuto.transport).toBeInstanceOf(ServiceTransport)
        expect(clientAuto.pendingRequests).toBeInstanceOf(Map)
    })


    test('request creates and sends service request', async () => {
        const transportSpy = vi.spyOn(transport, 'send')
        
        const requestPromise = client.request('testAction', {param1: 'value1'})
        
        expect(transportSpy).toHaveBeenCalledWith({
            type: 'service-request',
            request: expect.objectContaining({
                action: 'testAction',
                params: {param1: 'value1'},
                id: expect.any(String),
                timestamp: expect.any(Number)
            })
        })
        
        expect(client.pendingRequests.size).toBe(1)
        
        const requestCall = transportSpy.mock.calls[0][0]
        const requestId = requestCall.request.id
        
        transportSpy.mockRestore()
        
        client.handleMessage({
            type: 'service-response',
            response: {
                requestId,
                success: true,
                data: {result: 'success'}
            }
        })
        
        const result = await requestPromise
        expect(result).toEqual({result: 'success'})
    })


    test('request with default parameters', async () => {
        const transportSpy = vi.spyOn(transport, 'send')
        
        const requestPromise = client.request('testAction')
        
        expect(transportSpy).toHaveBeenCalledWith({
            type: 'service-request',
            request: expect.objectContaining({
                action: 'testAction',
                params: {},
                id: expect.any(String),
                timestamp: expect.any(Number)
            })
        })
        
        const requestCall = transportSpy.mock.calls[0][0]
        const requestId = requestCall.request.id
        
        transportSpy.mockRestore()
        
        client.handleMessage({
            type: 'service-response',
            response: {
                requestId,
                success: true,
                data: null
            }
        })
        
        const result = await requestPromise
        expect(result).toBeNull()
    })


    test('request timeout', async () => {
        const requestPromise = client.request('testAction', {}, 100)
        
        await expect(requestPromise).rejects.toThrow("Request timeout for action 'testAction'")
        expect(client.pendingRequests.size).toBe(0)
    })


    test('request success response', async () => {
        const requestPromise = client.request('testAction')
        
        const pendingRequest = Array.from(client.pendingRequests.keys())[0]
        
        client.handleMessage({
            type: 'service-response',
            response: {
                requestId: pendingRequest,
                success: true,
                data: {result: 'success', value: 42}
            }
        })
        
        const result = await requestPromise
        expect(result).toEqual({result: 'success', value: 42})
        expect(client.pendingRequests.size).toBe(0)
    })


    test('request error response', async () => {
        const requestPromise = client.request('testAction')
        
        const pendingRequest = Array.from(client.pendingRequests.keys())[0]
        
        client.handleMessage({
            type: 'service-response',
            response: {
                requestId: pendingRequest,
                success: false,
                error: 'Something went wrong'
            }
        })
        
        await expect(requestPromise).rejects.toThrow('Something went wrong')
        expect(client.pendingRequests.size).toBe(0)
    })


    test('handleMessage ignores non-service-response messages', () => {
        client.request('testAction')
        
        client.handleMessage({type: 'other-message'})
        client.handleMessage({type: 'service-request'})

        expect(client.pendingRequests.size).toBe(1)
    })


    test('handleMessage ignores unknown request ids', () => {
        client.request('testAction')

        client.handleMessage({
            type: 'service-response',
            response: {
                requestId: 'unknown-id',
                success: true,
                data: null
            }
        })
        
        expect(client.pendingRequests.size).toBe(1)
    })


    test('multiple concurrent requests', async () => {
        const request1 = client.request('action1', {input: 1})
        const request2 = client.request('action2', {input: 2})
        const request3 = client.request('action3', {input: 3})
        
        expect(client.pendingRequests.size).toBe(3)
        
        const requestIds = Array.from(client.pendingRequests.keys())
        
        client.handleMessage({
            type: 'service-response',
            response: {
                requestId: requestIds[1],
                success: true,
                data: {output: 2}
            }
        })
        
        client.handleMessage({
            type: 'service-response',
            response: {
                requestId: requestIds[0],
                success: true,
                data: {output: 1}
            }
        })
        
        client.handleMessage({
            type: 'service-response',
            response: {
                requestId: requestIds[2],
                success: false,
                error: 'Error in action3'
            }
        })
        
        const [result1, result2] = await Promise.allSettled([request1, request2])
        
        expect(result1.status).toBe('fulfilled')
        expect(result1.value).toEqual({output: 1})
        
        expect(result2.status).toBe('fulfilled')
        expect(result2.value).toEqual({output: 2})
        
        await expect(request3).rejects.toThrow('Error in action3')
        expect(client.pendingRequests.size).toBe(0)
    })


    test('full client-host integration', async () => {
        const [transportA, transportB] = ServiceTransport.pair()
        const clientA = new ServiceClient({transport: transportA})
        const hostB = new ServiceHost({transport: transportB})
        
        hostB.register('echo', (req, res) => {
            res.send({echo: req.params.message, timestamp: req.timestamp})
        })
        
        hostB.register('calculate', (req, res) => {
            const {a, b, operation} = req.params
            if (operation === 'add') {
                res.send({result: a + b})
            } else {
                res.error('Unsupported operation')
            }
        })
        
        const echoResult = await clientA.request('echo', {message: 'hello world'})
        expect(echoResult.echo).toBe('hello world')
        expect(echoResult.timestamp).toBeDefined()
        
        const calcResult = await clientA.request('calculate', {a: 5, b: 3, operation: 'add'})
        expect(calcResult).toEqual({result: 8})
        
        await expect(
            clientA.request('calculate', {a: 5, b: 3, operation: 'multiply'})
        ).rejects.toThrow('Unsupported operation')
        
        await expect(
            clientA.request('unknownAction')
        ).rejects.toThrow("Action 'unknownAction' not found")
    })


    test('timeout cleanup with custom timeout', async () => {
        const shortTimeoutPromise = client.request('testAction', {}, 50)
        
        expect(client.pendingRequests.size).toBe(1)
        
        await expect(shortTimeoutPromise).rejects.toThrow("Request timeout for action 'testAction'")
        expect(client.pendingRequests.size).toBe(0)
    })


    test('request id uniqueness', () => {
        const transportSpy = vi.spyOn(transport, 'send')
        
        client.request('action1')
        client.request('action2')
        client.request('action3')
        
        const calls = transportSpy.mock.calls
        const ids = calls.map(call => call[0].request.id)
        
        expect(new Set(ids).size).toBe(3)
        
        transportSpy.mockRestore()
    })

})
