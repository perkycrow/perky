import ServiceTransport from './service_transport'
import {vi} from 'vitest'


describe(ServiceTransport, () => {

    test('constructor', () => {
        const sendFn = vi.fn()
        const receiveFn = vi.fn()
        
        const transport = new ServiceTransport({
            send: sendFn,
            receive: receiveFn
        })
        
        expect(transport.sendFn).toBe(sendFn)
        expect(transport.messageHandlers).toBeInstanceOf(Set)
        expect(transport.messageHandlers.size).toBe(0)
        expect(receiveFn).toHaveBeenCalledWith(expect.any(Function))
    })


    test('send', () => {
        const sendFn = vi.fn()
        const transport = new ServiceTransport({send: sendFn})
        const message = {type: 'test', data: 'hello'}
        
        transport.send(message)
        
        expect(sendFn).toHaveBeenCalledWith(message)
    })


    test('onMessage and offMessage', () => {
        const transport = new ServiceTransport({send: vi.fn()})
        const handler1 = vi.fn()
        const handler2 = vi.fn()
        
        transport.onMessage(handler1)
        transport.onMessage(handler2)
        
        expect(transport.messageHandlers.has(handler1)).toBe(true)
        expect(transport.messageHandlers.has(handler2)).toBe(true)
        expect(transport.messageHandlers.size).toBe(2)
        
        transport.offMessage(handler1)
        expect(transport.messageHandlers.has(handler1)).toBe(false)
        expect(transport.messageHandlers.has(handler2)).toBe(true)
        expect(transport.messageHandlers.size).toBe(1)
    })


    test('handleMessage', () => {
        const transport = new ServiceTransport({send: vi.fn()})
        const handler1 = vi.fn()
        const handler2 = vi.fn()
        const message = {type: 'test', data: 'hello'}
        
        transport.onMessage(handler1)
        transport.onMessage(handler2)
        
        transport.handleMessage(message)
        
        expect(handler1).toHaveBeenCalledWith(message)
        expect(handler2).toHaveBeenCalledWith(message)
    })


    test('create static method', () => {
        const config = {
            send: vi.fn(),
            receive: vi.fn()
        }
        
        const transport = ServiceTransport.create(config)
        
        expect(transport).toBeInstanceOf(ServiceTransport)
        expect(transport.sendFn).toBe(config.send)
    })


    test('auto with postMessage target', () => {
        const target = {
            postMessage: vi.fn(),
            onmessage: null
        }
        
        const transport = ServiceTransport.auto(target)
        
        expect(transport).toBeInstanceOf(ServiceTransport)
        
        const message = {type: 'test'}
        transport.send(message)
        expect(target.postMessage).toHaveBeenCalledWith(message)
    })


    test('auto with self available', () => {
        const originalSelf = globalThis.self
        globalThis.self = {
            postMessage: vi.fn(),
            onmessage: null
        }
        
        const transport = ServiceTransport.auto()
        
        expect(transport).toBeInstanceOf(ServiceTransport)
        
        const message = {type: 'test'}
        transport.send(message)
        expect(globalThis.self.postMessage).toHaveBeenCalledWith(message)
        
        globalThis.self = originalSelf
    })


    test('auto fallback to local', () => {
        const originalSelf = globalThis.self
        delete globalThis.self
        
        const transport = ServiceTransport.auto()
        
        expect(transport).toBeInstanceOf(ServiceTransport)
        
        globalThis.self = originalSelf
    })


    test('worker static method', () => {
        const worker = {
            postMessage: vi.fn(),
            onmessage: null
        }
        
        const transport = ServiceTransport.worker(worker)
        
        expect(transport).toBeInstanceOf(ServiceTransport)
        
        const message = {type: 'test'}
        transport.send(message)
        expect(worker.postMessage).toHaveBeenCalledWith(message)
    })


    test('main static method', () => {
        const originalSelf = globalThis.self
        globalThis.self = {
            postMessage: vi.fn(),
            onmessage: null
        }
        
        const transport = ServiceTransport.main()
        
        expect(transport).toBeInstanceOf(ServiceTransport)
        
        const message = {type: 'test'}
        transport.send(message)
        expect(globalThis.self.postMessage).toHaveBeenCalledWith(message)
        
        globalThis.self = originalSelf
    })


    test('local static method', () => {
        const transport = ServiceTransport.local()
        
        expect(transport).toBeInstanceOf(ServiceTransport)
        
        const handler = vi.fn()
        transport.onMessage(handler)
        
        const message = {type: 'test', data: 'hello'}
        transport.send(message)
        
        expect(handler).toHaveBeenCalledWith(message)
    })


    test('channel static method', () => {
        const port = {
            postMessage: vi.fn(),
            onmessage: null
        }
        
        const transport = ServiceTransport.channel(port)
        
        expect(transport).toBeInstanceOf(ServiceTransport)
        
        const message = {type: 'test'}
        transport.send(message)
        expect(port.postMessage).toHaveBeenCalledWith(message)
    })


    test('pair static method', () => {
        const [transportA, transportB] = ServiceTransport.pair()
        
        expect(transportA).toBeInstanceOf(ServiceTransport)
        expect(transportB).toBeInstanceOf(ServiceTransport)
        expect(transportA).not.toBe(transportB)
        
        const handlerA = vi.fn()
        const handlerB = vi.fn()
        
        transportA.onMessage(handlerA)
        transportB.onMessage(handlerB)
        
        const messageToB = {type: 'test', data: 'hello B'}
        const messageToA = {type: 'test', data: 'hello A'}
        
        transportA.send(messageToB)
        transportB.send(messageToA)
        
        expect(handlerA).toHaveBeenCalledWith(messageToA)
        expect(handlerB).toHaveBeenCalledWith(messageToB)
        expect(handlerA).not.toHaveBeenCalledWith(messageToB)
        expect(handlerB).not.toHaveBeenCalledWith(messageToA)
    })


    test('pair bidirectional communication', () => {
        const [transportA, transportB] = ServiceTransport.pair()
        
        const messagesA = []
        const messagesB = []
        
        transportA.onMessage((msg) => messagesA.push(msg))
        transportB.onMessage((msg) => messagesB.push(msg))
        
        transportA.send({from: 'A', id: 1})
        transportB.send({from: 'B', id: 1})
        transportA.send({from: 'A', id: 2})
        transportB.send({from: 'B', id: 2})
        
        expect(messagesA).toEqual([
            {from: 'B', id: 1},
            {from: 'B', id: 2}
        ])
        expect(messagesB).toEqual([
            {from: 'A', id: 1},
            {from: 'A', id: 2}
        ])
    })


    test('receive function integration', () => {
        let messageHandler
        const receiveFn = vi.fn((handler) => {
            messageHandler = handler
        })
        
        const transport = new ServiceTransport({
            send: vi.fn(),
            receive: receiveFn
        })
        
        const handler = vi.fn()
        transport.onMessage(handler)
        
        const message = {type: 'test', data: 'hello'}
        messageHandler(message)
        
        expect(handler).toHaveBeenCalledWith(message)
    })

})
