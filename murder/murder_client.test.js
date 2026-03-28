import MurderClient from './murder_client.js'
import PerkyModule from '../core/perky_module.js'
import {vi} from 'vitest'


function createMockWebSocket () {
    const ws = {
        readyState: 1,
        send: vi.fn(),
        close: vi.fn(),
        onopen: null,
        onmessage: null,
        onerror: null,
        onclose: null
    }
    return ws
}


function mockWebSocketGlobal () {
    const instances = []
    globalThis.WebSocket = vi.fn((url) => {
        const ws = createMockWebSocket()
        ws.url = url
        instances.push(ws)
        return ws
    })
    globalThis.WebSocket.OPEN = 1
    return instances
}


describe(MurderClient, () => {

    let wsInstances

    beforeEach(() => {
        wsInstances = mockWebSocketGlobal()
    })

    afterEach(() => {
        delete globalThis.WebSocket
    })


    test('constructor', () => {
        const client = new MurderClient({
            host: 'murder.test',
            lobbyToken: 'abc123',
            protocol: 'ws:'
        })

        expect(client.serverHost).toBe('murder.test')
        expect(client.lobbyToken).toBe('abc123')
        expect(client.protocol).toBe('ws:')
        expect(client.userId).toBeNull()
        expect(client.connected).toBe(false)
    })


    test('constructor defaults', () => {
        const client = new MurderClient()
        expect(client.serverHost).toBe('')
        expect(client.lobbyToken).toBe('')
        expect(client.protocol).toBe('wss:')
    })


    test('extends PerkyModule', () => {
        const client = new MurderClient()
        expect(client).toBeInstanceOf(PerkyModule)
    })


    test('$category', () => {
        expect(MurderClient.$category).toBe('murderClient')
    })


    test('$eagerStart', () => {
        expect(MurderClient.$eagerStart).toBe(false)
    })


    test('connect creates WebSocket and subscribes', async () => {
        const client = new MurderClient({
            host: 'murder.test',
            lobbyToken: 'lobby1',
            protocol: 'ws:'
        })

        const connectPromise = client.connect()
        const ws = wsInstances[0]

        expect(ws.url).toBe('ws://murder.test/cable')

        ws.onopen()

        expect(ws.send).toHaveBeenCalledWith(JSON.stringify({
            command: 'subscribe',
            identifier: JSON.stringify({
                channel: 'SignalingChannel',
                lobby_token: 'lobby1'
            })
        }))

        ws.onmessage({data: JSON.stringify({type: 'confirm_subscription'})})
        ws.onmessage({data: JSON.stringify({
            message: {type: 'user_id', payload: 42}
        })})

        await connectPromise
        expect(client.userId).toBe(42)
    })


    test('connect emits identified', async () => {
        const client = new MurderClient({host: 'h', lobbyToken: 't', protocol: 'ws:'})
        const handler = vi.fn()
        client.on('identified', handler)

        const p = client.connect()
        const ws = wsInstances[0]
        ws.onopen()
        ws.onmessage({data: JSON.stringify({message: {type: 'user_id', payload: 7}})})
        await p

        expect(handler).toHaveBeenCalledWith(7)
    })


    test('connect emits subscribed', async () => {
        const client = new MurderClient({host: 'h', lobbyToken: 't', protocol: 'ws:'})
        const handler = vi.fn()
        client.on('subscribed', handler)

        const p = client.connect()
        const ws = wsInstances[0]
        ws.onopen()
        ws.onmessage({data: JSON.stringify({type: 'confirm_subscription'})})
        ws.onmessage({data: JSON.stringify({message: {type: 'user_id', payload: 1}})})
        await p

        expect(handler).toHaveBeenCalled()
    })


    test('connect rejects on subscription rejection', async () => {
        const client = new MurderClient({host: 'h', lobbyToken: 't', protocol: 'ws:'})

        const p = client.connect()
        const ws = wsInstances[0]
        ws.onopen()
        ws.onmessage({data: JSON.stringify({type: 'reject_subscription'})})

        await expect(p).rejects.toThrow('Subscription rejected')
    })


    test('connect rejects on WebSocket error', async () => {
        const client = new MurderClient({host: 'h', lobbyToken: 't', protocol: 'ws:'})

        const p = client.connect()
        const ws = wsInstances[0]
        ws.onerror()

        await expect(p).rejects.toThrow('WebSocket error')
    })


    test('connect ignores welcome and ping messages', async () => {
        const client = new MurderClient({host: 'h', lobbyToken: 't', protocol: 'ws:'})

        const p = client.connect()
        const ws = wsInstances[0]
        ws.onopen()
        ws.onmessage({data: JSON.stringify({type: 'welcome'})})
        ws.onmessage({data: JSON.stringify({type: 'ping'})})
        ws.onmessage({data: JSON.stringify({message: {type: 'user_id', payload: 1}})})
        await p

        expect(client.userId).toBe(1)
    })


    test('connect emits signal for non-user_id messages', async () => {
        const client = new MurderClient({host: 'h', lobbyToken: 't', protocol: 'ws:'})
        const handler = vi.fn()
        client.on('signal', handler)

        const p = client.connect()
        const ws = wsInstances[0]
        ws.onopen()
        ws.onmessage({data: JSON.stringify({message: {type: 'user_id', payload: 1}})})
        await p

        ws.onmessage({data: JSON.stringify({
            message: {type: 'offer', from: 2, payload: {sdp: 'test'}}
        })})

        expect(handler).toHaveBeenCalledWith({type: 'offer', from: 2, payload: {sdp: 'test'}})
    })


    test('connect does nothing if already connected', async () => {
        const client = new MurderClient({host: 'h', lobbyToken: 't', protocol: 'ws:'})

        const p = client.connect()
        const ws = wsInstances[0]
        ws.onopen()
        ws.onmessage({data: JSON.stringify({message: {type: 'user_id', payload: 1}})})
        await p

        await client.connect()
        expect(wsInstances.length).toBe(1)
    })


    test('disconnect closes socket', async () => {
        const client = new MurderClient({host: 'h', lobbyToken: 't', protocol: 'ws:'})

        const p = client.connect()
        const ws = wsInstances[0]
        ws.onopen()
        ws.onmessage({data: JSON.stringify({message: {type: 'user_id', payload: 1}})})
        await p

        client.disconnect()
        expect(ws.close).toHaveBeenCalled()
        expect(client.userId).toBeNull()
    })


    test('disconnect does nothing without socket', () => {
        const client = new MurderClient()
        client.disconnect()
    })


    test('sendSignal sends through WebSocket', async () => {
        const client = new MurderClient({host: 'h', lobbyToken: 'tok', protocol: 'ws:'})

        const p = client.connect()
        const ws = wsInstances[0]
        ws.onopen()
        ws.onmessage({data: JSON.stringify({message: {type: 'user_id', payload: 1}})})
        await p

        const result = client.sendSignal({type: 'hello'})
        expect(result).toBe(true)

        const sent = JSON.parse(ws.send.mock.calls[ws.send.mock.calls.length - 1][0])
        expect(sent.command).toBe('message')
        expect(JSON.parse(sent.data)).toEqual({action: 'signal', type: 'hello'})
    })


    test('sendSignal returns false when not connected', () => {
        const client = new MurderClient()
        expect(client.sendSignal({type: 'hello'})).toBe(false)
    })


    test('connected getter', async () => {
        const client = new MurderClient({host: 'h', lobbyToken: 't', protocol: 'ws:'})
        expect(client.connected).toBe(false)

        const p = client.connect()
        const ws = wsInstances[0]
        ws.onopen()
        ws.onmessage({data: JSON.stringify({message: {type: 'user_id', payload: 1}})})
        await p

        expect(client.connected).toBe(true)
    })


    test('onclose emits disconnected', async () => {
        const client = new MurderClient({host: 'h', lobbyToken: 't', protocol: 'ws:'})
        const handler = vi.fn()
        client.on('disconnected', handler)

        const p = client.connect()
        const ws = wsInstances[0]
        ws.onopen()
        ws.onmessage({data: JSON.stringify({message: {type: 'user_id', payload: 1}})})
        await p

        ws.onclose()
        expect(handler).toHaveBeenCalled()
    })


    test('onStop disconnects', async () => {
        const client = new MurderClient({host: 'h', lobbyToken: 't', protocol: 'ws:'})

        const p = client.connect()
        const ws = wsInstances[0]
        ws.onopen()
        ws.onmessage({data: JSON.stringify({message: {type: 'user_id', payload: 1}})})
        await p

        client.start()
        client.stop()
        expect(ws.close).toHaveBeenCalled()
    })

})
