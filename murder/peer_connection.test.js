import PeerConnection from './peer_connection.js'
import PerkyModule from '../core/perky_module.js'
import {vi} from 'vitest'


function createMockRTCPeerConnection () {
    const pc = {
        connectionState: 'new',
        signalingState: 'stable',
        onicecandidate: null,
        onconnectionstatechange: null,
        ondatachannel: null,
        createDataChannel: vi.fn(),
        createOffer: vi.fn(),
        createAnswer: vi.fn(),
        setLocalDescription: vi.fn(),
        setRemoteDescription: vi.fn(),
        addIceCandidate: vi.fn(),
        close: vi.fn()
    }

    pc.createOffer.mockResolvedValue({type: 'offer', sdp: 'mock-offer'})
    pc.createAnswer.mockResolvedValue({type: 'answer', sdp: 'mock-answer'})
    pc.setLocalDescription.mockImplementation(async (desc) => {
        if (desc) {
            pc.localDescription = desc
            if (desc.type === 'offer') {
                pc.signalingState = 'have-local-offer'
            }
        } else if (pc.signalingState === 'stable') {
            pc.localDescription = {type: 'offer', sdp: 'mock-offer'}
            pc.signalingState = 'have-local-offer'
        } else if (pc.signalingState === 'have-remote-offer') {
            pc.localDescription = {type: 'answer', sdp: 'mock-answer'}
            pc.signalingState = 'stable'
        }
    })
    pc.setRemoteDescription.mockImplementation(async (desc) => {
        pc.remoteDescription = desc
        if (desc.type === 'offer') {
            pc.signalingState = 'have-remote-offer'
        } else if (desc.type === 'answer') {
            pc.signalingState = 'stable'
        }
    })
    pc.addIceCandidate.mockResolvedValue(undefined)

    return pc
}


function createMockChannel () {
    return {
        readyState: 'open',
        send: vi.fn(),
        close: vi.fn(),
        onopen: null,
        onclose: null,
        onmessage: null
    }
}


function mockRTCGlobal () {
    const instances = []
    globalThis.RTCPeerConnection = vi.fn(() => {
        const pc = createMockRTCPeerConnection()
        const channel = createMockChannel()
        pc.createDataChannel.mockReturnValue(channel)
        pc.mockChannel = channel
        instances.push(pc)
        return pc
    })
    return instances
}


describe(PeerConnection, () => {

    let rtcInstances

    beforeEach(() => {
        rtcInstances = mockRTCGlobal()
    })

    afterEach(() => {
        delete globalThis.RTCPeerConnection
    })


    test('constructor', () => {
        const peer = new PeerConnection({peerId: 42})
        expect(peer.peerId).toBe(42)
        expect(peer.connectionState).toBe('new')
        expect(peer.channelReady).toBe(false)
    })


    test('extends PerkyModule', () => {
        const peer = new PeerConnection({peerId: 1})
        expect(peer).toBeInstanceOf(PerkyModule)
    })


    test('$category', () => {
        expect(PeerConnection.$category).toBe('peerConnection')
    })


    test('$eagerStart', () => {
        expect(PeerConnection.$eagerStart).toBe(false)
    })


    test('createOffer', async () => {
        const peer = new PeerConnection({peerId: 5})
        const sendSignal = vi.fn()

        await peer.createOffer(sendSignal)

        const rtc = rtcInstances[0]
        expect(rtc.createDataChannel).toHaveBeenCalledWith('game')
        expect(rtc.setLocalDescription).toHaveBeenCalled()
        expect(sendSignal).toHaveBeenCalledWith({
            type: 'offer',
            to: 5,
            payload: {type: 'offer', sdp: 'mock-offer'}
        })
    })


    test('createOffer does nothing if already connected', async () => {
        const peer = new PeerConnection({peerId: 5})
        const sendSignal = vi.fn()

        await peer.createOffer(sendSignal)
        await peer.createOffer(sendSignal)

        expect(rtcInstances.length).toBe(1)
    })


    test('handleOffer', async () => {
        const peer = new PeerConnection({peerId: 3})
        const sendSignal = vi.fn()
        const offer = {type: 'offer', sdp: 'remote-offer'}

        await peer.handleOffer(offer, sendSignal)

        const rtc = rtcInstances[0]
        expect(rtc.setRemoteDescription).toHaveBeenCalledWith(offer)
        expect(rtc.setLocalDescription).toHaveBeenCalled()
        expect(sendSignal).toHaveBeenCalledWith({
            type: 'answer',
            to: 3,
            payload: {type: 'answer', sdp: 'mock-answer'}
        })
    })


    test('handleOffer does nothing if already connected', async () => {
        const peer = new PeerConnection({peerId: 3})
        const sendSignal = vi.fn()

        await peer.handleOffer({type: 'offer', sdp: 'a'}, sendSignal)
        await peer.handleOffer({type: 'offer', sdp: 'b'}, sendSignal)

        expect(rtcInstances.length).toBe(1)
    })


    test('handleOffer sets up ondatachannel', async () => {
        const peer = new PeerConnection({peerId: 3})
        const sendSignal = vi.fn()

        await peer.handleOffer({type: 'offer', sdp: 'a'}, sendSignal)

        const rtc = rtcInstances[0]
        const channel = createMockChannel()
        rtc.ondatachannel({channel})

        expect(peer.channel).toBe(channel)
    })


    test('handleAnswer', async () => {
        const peer = new PeerConnection({peerId: 5})
        await peer.createOffer(vi.fn())

        const rtc = rtcInstances[0]
        rtc.signalingState = 'have-local-offer'

        const answer = {type: 'answer', sdp: 'remote-answer'}
        await peer.handleAnswer(answer)

        expect(rtc.setRemoteDescription).toHaveBeenCalledWith(answer)
    })


    test('handleAnswer ignores wrong signaling state', async () => {
        const peer = new PeerConnection({peerId: 5})
        await peer.createOffer(vi.fn())

        const rtc = rtcInstances[0]
        rtc.signalingState = 'stable'
        rtc.setRemoteDescription.mockClear()

        await peer.handleAnswer({type: 'answer', sdp: 'a'})
        expect(rtc.setRemoteDescription).not.toHaveBeenCalled()
    })


    test('handleAnswer does nothing without connection', async () => {
        const peer = new PeerConnection({peerId: 5})
        await peer.handleAnswer({type: 'answer', sdp: 'a'})
        expect(rtcInstances.length).toBe(0)
    })


    test('handleIce buffers candidates until remote description is set', async () => {
        const peer = new PeerConnection({peerId: 5})
        await peer.createOffer(vi.fn())

        const candidate = {candidate: 'ice-candidate'}
        peer.handleIce(candidate)

        expect(rtcInstances[0].addIceCandidate).not.toHaveBeenCalled()

        await peer.handleAnswer({type: 'answer', sdp: 'mock-answer'})

        expect(rtcInstances[0].addIceCandidate).toHaveBeenCalledWith(candidate)
    })


    test('handleIce does nothing without connection', () => {
        const peer = new PeerConnection({peerId: 5})
        peer.handleIce({candidate: 'ice'})
        expect(rtcInstances.length).toBe(0)
    })


    test('send', async () => {
        const peer = new PeerConnection({peerId: 5})
        await peer.createOffer(vi.fn())

        const channel = rtcInstances[0].mockChannel
        channel.readyState = 'open'

        const result = peer.send({action: 'move', x: 10})
        expect(result).toBe(true)
        expect(channel.send).toHaveBeenCalledWith(JSON.stringify({action: 'move', x: 10}))
    })


    test('send returns false when channel not ready', () => {
        const peer = new PeerConnection({peerId: 5})
        expect(peer.send({action: 'move'})).toBe(false)
    })


    test('emits ice event', async () => {
        const peer = new PeerConnection({peerId: 5})
        const handler = vi.fn()
        peer.on('ice', handler)

        await peer.createOffer(vi.fn())

        const rtc = rtcInstances[0]
        rtc.onicecandidate({candidate: {candidate: 'ice-data'}})

        expect(handler).toHaveBeenCalledWith({candidate: 'ice-data'})
    })


    test('does not emit ice for null candidate', async () => {
        const peer = new PeerConnection({peerId: 5})
        const handler = vi.fn()
        peer.on('ice', handler)

        await peer.createOffer(vi.fn())

        rtcInstances[0].onicecandidate({candidate: null})
        expect(handler).not.toHaveBeenCalled()
    })


    test('emits connected on connection state change', async () => {
        const peer = new PeerConnection({peerId: 5})
        const handler = vi.fn()
        peer.on('connected', handler)

        await peer.createOffer(vi.fn())

        const rtc = rtcInstances[0]
        rtc.connectionState = 'connected'
        rtc.onconnectionstatechange()

        expect(handler).toHaveBeenCalled()
    })


    test('emits disconnected on failed state', async () => {
        const peer = new PeerConnection({peerId: 5})
        const handler = vi.fn()
        peer.on('disconnected', handler)

        await peer.createOffer(vi.fn())

        const rtc = rtcInstances[0]
        rtc.connectionState = 'failed'
        rtc.onconnectionstatechange()

        expect(handler).toHaveBeenCalled()
    })


    test('channel:open event', async () => {
        const peer = new PeerConnection({peerId: 5})
        const handler = vi.fn()
        peer.on('channel:open', handler)

        await peer.createOffer(vi.fn())

        rtcInstances[0].mockChannel.onopen()
        expect(handler).toHaveBeenCalled()
    })


    test('message event', async () => {
        const peer = new PeerConnection({peerId: 5})
        const handler = vi.fn()
        peer.on('message', handler)

        await peer.createOffer(vi.fn())

        rtcInstances[0].mockChannel.onmessage({data: JSON.stringify({hello: 'world'})})
        expect(handler).toHaveBeenCalledWith({hello: 'world'})
    })


    test('close', async () => {
        const peer = new PeerConnection({peerId: 5})
        await peer.createOffer(vi.fn())

        const rtc = rtcInstances[0]
        const channel = rtc.mockChannel

        peer.close()

        expect(channel.close).toHaveBeenCalled()
        expect(rtc.close).toHaveBeenCalled()
        expect(peer.channelReady).toBe(false)
    })


    test('close without connection', () => {
        const peer = new PeerConnection({peerId: 5})
        peer.close()
    })


    test('onStop calls close', async () => {
        const peer = new PeerConnection({peerId: 5})
        await peer.createOffer(vi.fn())

        peer.start()
        peer.stop()

        expect(rtcInstances[0].close).toHaveBeenCalled()
    })


    test('connectionState from RTCPeerConnection', async () => {
        const peer = new PeerConnection({peerId: 5})
        expect(peer.connectionState).toBe('new')

        await peer.createOffer(vi.fn())
        rtcInstances[0].connectionState = 'connecting'

        expect(peer.connectionState).toBe('connecting')
    })

})
