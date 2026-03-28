import MurderNetwork from './murder_network.js'
import MurderClient from './murder_client.js'
import PeerConnection from './peer_connection.js'
import PerkyModule from '../core/perky_module.js'
import {vi} from 'vitest'


function createMockWebSocket () {
    return {
        readyState: 1,
        send: vi.fn(),
        close: vi.fn(),
        onopen: null,
        onmessage: null,
        onerror: null,
        onclose: null
    }
}


function mockWebSocketGlobal () {
    const instances = []
    globalThis.WebSocket = vi.fn(() => {
        const ws = createMockWebSocket()
        instances.push(ws)
        return ws
    })
    globalThis.WebSocket.OPEN = 1
    return instances
}


function createMockRTCPeerConnection () {
    const channel = {
        readyState: 'open',
        send: vi.fn(),
        close: vi.fn(),
        onopen: null,
        onclose: null,
        onmessage: null
    }

    const pc = {
        connectionState: 'new',
        signalingState: 'stable',
        onicecandidate: null,
        onconnectionstatechange: null,
        ondatachannel: null,
        createDataChannel: vi.fn(() => channel),
        createOffer: vi.fn().mockResolvedValue({type: 'offer', sdp: 'mock'}),
        createAnswer: vi.fn().mockResolvedValue({type: 'answer', sdp: 'mock'}),
        setLocalDescription: vi.fn().mockResolvedValue(undefined),
        setRemoteDescription: vi.fn().mockResolvedValue(undefined),
        addIceCandidate: vi.fn().mockResolvedValue(undefined),
        close: vi.fn(),
        mockChannel: channel
    }

    return pc
}


function mockRTCGlobal () {
    const instances = []
    globalThis.RTCPeerConnection = vi.fn(() => {
        const pc = createMockRTCPeerConnection()
        instances.push(pc)
        return pc
    })
    return instances
}


async function connectNetwork (network, wsInstances) {
    const p = network.connect({host: 'h', lobbyToken: 't', protocol: 'ws:'})
    const ws = wsInstances[0]
    ws.onopen()
    ws.onmessage({data: JSON.stringify({message: {type: 'user_id', payload: 1}})})
    await p
    return ws
}


function simulateSignal (ws, signal) {
    ws.onmessage({data: JSON.stringify({message: signal})})
}


describe(MurderNetwork, () => {

    let wsInstances
    let rtcInstances

    beforeEach(() => {
        wsInstances = mockWebSocketGlobal()
        rtcInstances = mockRTCGlobal()
    })

    afterEach(() => {
        delete globalThis.WebSocket
        delete globalThis.RTCPeerConnection
    })


    test('constructor', () => {
        const network = new MurderNetwork()
        expect(network).toBeInstanceOf(PerkyModule)
        expect(network.peers).toEqual([])
        expect(network.peerIds).toEqual([])
    })


    test('$category', () => {
        expect(MurderNetwork.$category).toBe('murderNetwork')
    })


    test('$eagerStart', () => {
        expect(MurderNetwork.$eagerStart).toBe(false)
    })


    test('connect creates MurderClient child', async () => {
        const network = new MurderNetwork()
        await connectNetwork(network, wsInstances)

        expect(network.client).toBeInstanceOf(MurderClient)
        expect(network.userId).toBe(1)
    })


    test('connect sends hello signal', async () => {
        const network = new MurderNetwork()
        const ws = await connectNetwork(network, wsInstances)

        const lastCall = ws.send.mock.calls[ws.send.mock.calls.length - 1][0]
        const parsed = JSON.parse(lastCall)
        expect(JSON.parse(parsed.data)).toEqual({action: 'signal', type: 'hello'})
    })


    test('hello from higher peer triggers offer', async () => {
        const network = new MurderNetwork()
        const ws = await connectNetwork(network, wsInstances)

        simulateSignal(ws, {type: 'hello', from: 5})

        await vi.waitFor(() => {
            expect(rtcInstances.length).toBe(1)
        })

        expect(network.peers.length).toBe(1)
        expect(network.peerIds).toEqual([5])
    })


    test('hello from lower peer does not trigger offer', async () => {
        const network = new MurderNetwork()
        const ws = await connectNetwork(network, wsInstances)

        simulateSignal(ws, {type: 'hello', from: 0})

        expect(rtcInstances.length).toBe(0)
        expect(network.peers.length).toBe(0)
    })


    test('hello from self is ignored', async () => {
        const network = new MurderNetwork()
        const ws = await connectNetwork(network, wsInstances)

        simulateSignal(ws, {type: 'hello', from: 1})

        expect(rtcInstances.length).toBe(0)
    })


    test('offer signal creates peer and handles offer', async () => {
        const network = new MurderNetwork()
        const ws = await connectNetwork(network, wsInstances)

        simulateSignal(ws, {
            type: 'offer',
            from: 2,
            to: 1,
            payload: {type: 'offer', sdp: 'remote'}
        })

        await vi.waitFor(() => {
            expect(rtcInstances.length).toBe(1)
        })

        expect(rtcInstances[0].setRemoteDescription).toHaveBeenCalledWith({type: 'offer', sdp: 'remote'})
    })


    test('answer signal is forwarded to peer', async () => {
        const network = new MurderNetwork()
        const ws = await connectNetwork(network, wsInstances)

        simulateSignal(ws, {type: 'hello', from: 5})
        await vi.waitFor(() => expect(rtcInstances.length).toBe(1))

        rtcInstances[0].signalingState = 'have-local-offer'

        simulateSignal(ws, {
            type: 'answer',
            from: 5,
            to: 1,
            payload: {type: 'answer', sdp: 'remote-answer'}
        })

        await vi.waitFor(() => {
            expect(rtcInstances[0].setRemoteDescription).toHaveBeenCalledWith(
                {type: 'answer', sdp: 'remote-answer'}
            )
        })
    })


    test('ice signal is forwarded to peer', async () => {
        const network = new MurderNetwork()
        const ws = await connectNetwork(network, wsInstances)

        simulateSignal(ws, {type: 'hello', from: 5})
        await vi.waitFor(() => expect(rtcInstances.length).toBe(1))

        simulateSignal(ws, {
            type: 'ice',
            from: 5,
            to: 1,
            payload: {candidate: 'ice-data'}
        })

        expect(rtcInstances[0].addIceCandidate).toHaveBeenCalledWith({candidate: 'ice-data'})
    })


    test('signals addressed to other users are ignored', async () => {
        const network = new MurderNetwork()
        const ws = await connectNetwork(network, wsInstances)

        simulateSignal(ws, {
            type: 'offer',
            from: 2,
            to: 99,
            payload: {type: 'offer', sdp: 'x'}
        })

        expect(rtcInstances.length).toBe(0)
    })


    test('emits peer:connected', async () => {
        const network = new MurderNetwork()
        const handler = vi.fn()
        network.on('peer:connected', handler)

        const ws = await connectNetwork(network, wsInstances)
        simulateSignal(ws, {type: 'hello', from: 5})
        await vi.waitFor(() => expect(rtcInstances.length).toBe(1))

        const rtc = rtcInstances[0]
        rtc.connectionState = 'connected'
        rtc.onconnectionstatechange()

        expect(handler).toHaveBeenCalledWith(5, expect.any(PeerConnection))
    })


    test('emits peer:disconnected and removes peer', async () => {
        const network = new MurderNetwork()
        const handler = vi.fn()
        network.on('peer:disconnected', handler)

        const ws = await connectNetwork(network, wsInstances)
        simulateSignal(ws, {type: 'hello', from: 5})
        await vi.waitFor(() => expect(network.peers.length).toBe(1))

        const rtc = rtcInstances[0]
        rtc.connectionState = 'failed'
        rtc.onconnectionstatechange()

        expect(handler).toHaveBeenCalledWith(5, expect.any(PeerConnection))
        expect(network.peers.length).toBe(0)
    })


    test('emits message', async () => {
        const network = new MurderNetwork()
        const handler = vi.fn()
        network.on('message', handler)

        const ws = await connectNetwork(network, wsInstances)
        simulateSignal(ws, {type: 'hello', from: 5})
        await vi.waitFor(() => expect(rtcInstances.length).toBe(1))

        rtcInstances[0].mockChannel.onmessage({data: JSON.stringify({action: 'move', x: 10})})

        expect(handler).toHaveBeenCalledWith(5, {action: 'move', x: 10})
    })


    test('send to specific peer', async () => {
        const network = new MurderNetwork()
        const ws = await connectNetwork(network, wsInstances)
        simulateSignal(ws, {type: 'hello', from: 5})
        await vi.waitFor(() => expect(rtcInstances.length).toBe(1))

        const result = network.send(5, {action: 'attack'})
        expect(result).toBe(true)
        expect(rtcInstances[0].mockChannel.send).toHaveBeenCalledWith(
            JSON.stringify({action: 'attack'})
        )
    })


    test('send to unknown peer returns false', async () => {
        const network = new MurderNetwork()
        await connectNetwork(network, wsInstances)

        expect(network.send(999, {data: 'test'})).toBe(false)
    })


    test('broadcast', async () => {
        const network = new MurderNetwork()
        const ws = await connectNetwork(network, wsInstances)

        simulateSignal(ws, {type: 'hello', from: 5})
        await vi.waitFor(() => expect(rtcInstances.length).toBe(1))

        simulateSignal(ws, {
            type: 'offer',
            from: 8,
            to: 1,
            payload: {type: 'offer', sdp: 'x'}
        })
        await vi.waitFor(() => expect(rtcInstances.length).toBe(2))

        const rtc2 = rtcInstances[1]
        rtc2.ondatachannel({channel: rtc2.mockChannel})

        network.broadcast({action: 'sync'})

        expect(rtcInstances[0].mockChannel.send).toHaveBeenCalledWith(JSON.stringify({action: 'sync'}))
        expect(rtcInstances[1].mockChannel.send).toHaveBeenCalledWith(JSON.stringify({action: 'sync'}))
    })


    test('getPeer', async () => {
        const network = new MurderNetwork()
        const ws = await connectNetwork(network, wsInstances)

        expect(network.getPeer(5)).toBeNull()

        simulateSignal(ws, {type: 'hello', from: 5})
        await vi.waitFor(() => expect(network.peers.length).toBe(1))

        expect(network.getPeer(5)).toBeInstanceOf(PeerConnection)
    })


    test('disconnect closes everything', async () => {
        const network = new MurderNetwork()
        const ws = await connectNetwork(network, wsInstances)

        simulateSignal(ws, {type: 'hello', from: 5})
        await vi.waitFor(() => expect(rtcInstances.length).toBe(1))

        network.disconnect()

        expect(rtcInstances[0].close).toHaveBeenCalled()
        expect(ws.close).toHaveBeenCalled()
    })


    test('onStop disconnects', async () => {
        const network = new MurderNetwork()
        const ws = await connectNetwork(network, wsInstances)

        network.start()
        network.stop()

        expect(ws.close).toHaveBeenCalled()
    })


    test('ice from peer is sent through signaling', async () => {
        const network = new MurderNetwork()
        const ws = await connectNetwork(network, wsInstances)

        simulateSignal(ws, {type: 'hello', from: 5})
        await vi.waitFor(() => expect(rtcInstances.length).toBe(1))

        rtcInstances[0].onicecandidate({candidate: {candidate: 'my-ice'}})

        const lastCall = ws.send.mock.calls[ws.send.mock.calls.length - 1][0]
        const parsed = JSON.parse(lastCall)
        const data = JSON.parse(parsed.data)
        expect(data).toEqual({
            action: 'signal',
            type: 'ice',
            to: 5,
            payload: {candidate: 'my-ice'}
        })
    })

})
