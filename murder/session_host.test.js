import {describe, test, expect, vi} from 'vitest'
import SessionHost from './session_host.js'
import SessionClient from './session_client.js'
import ServiceHost from '../service/service_host.js'
import ServiceTransport from '../service/service_transport.js'


function createHost () {
    const host = new SessionHost()
    host.activate()
    return host
}


function createHostWithClient (peerId = 'player1') {
    const host = createHost()
    const clientTransport = host.addLocalTransport(peerId)
    const client = new SessionClient({transport: clientTransport, peerId})
    return {host, client}
}


describe('SessionHost', () => {

    test('extends ServiceHost', () => {
        const host = new SessionHost()
        expect(host).toBeInstanceOf(ServiceHost)
    })


    test('starts inactive', () => {
        const host = new SessionHost()
        expect(host.active).toBe(false)
    })


    test('activate and deactivate', () => {
        const host = new SessionHost()
        host.activate()
        expect(host.active).toBe(true)
        host.deactivate()
        expect(host.active).toBe(false)
    })


    test('has serviceMethods registered', () => {
        const host = new SessionHost()
        expect(host.actions.has('join')).toBe(true)
        expect(host.actions.has('input')).toBe(true)
        expect(host.actions.has('ping')).toBe(true)
    })


    test('addLocalTransport returns client-side transport', () => {
        const host = createHost()
        const clientTransport = host.addLocalTransport('player1')
        expect(clientTransport).toBeInstanceOf(ServiceTransport)
    })


    test('join adds player and returns slot', async () => {
        const {host, client} = createHostWithClient()

        const result = await client.join()

        expect(result.slot).toBe(0)
        expect(result.playerCount).toBe(1)
        expect(host.players.has('player1')).toBe(true)
    })


    test('join assigns incremental slots', async () => {
        const host = createHost()

        const t1 = host.addLocalTransport('p1')
        const c1 = new SessionClient({transport: t1, peerId: 'p1'})
        const t2 = host.addLocalTransport('p2')
        const c2 = new SessionClient({transport: t2, peerId: 'p2'})

        const r1 = await c1.join()
        const r2 = await c2.join()

        expect(r1.slot).toBe(0)
        expect(r2.slot).toBe(1)
    })


    test('join rejects when inactive', async () => {
        const host = new SessionHost()
        const clientTransport = host.addLocalTransport('p1')
        const client = new SessionClient({transport: clientTransport, peerId: 'p1'})

        await expect(client.join()).rejects.toThrow()
    })


    test('input stores move value', async () => {
        const {host, client} = createHostWithClient()
        await client.join()

        await client.sendMove(-1)

        const inputs = host.flushInputs()
        expect(inputs.get('player1').moveX).toBe(-1)
        expect(inputs.get('player1').moveY).toBe(0)
    })


    test('input stores 2D move value', async () => {
        const {host, client} = createHostWithClient()
        await client.join()

        await client.sendMove(0.5, -0.7)

        const inputs = host.flushInputs()
        expect(inputs.get('player1').moveX).toBe(0.5)
        expect(inputs.get('player1').moveY).toBe(-0.7)
    })


    test('input stores one-shot actions', async () => {
        const {host, client} = createHostWithClient()
        await client.join()

        await client.sendInput('jump')
        await client.sendInput('lunge')

        const inputs = host.flushInputs()
        expect(inputs.get('player1').actions).toEqual(['jump', 'lunge'])
    })


    test('flushInputs clears actions but preserves move', async () => {
        const {host, client} = createHostWithClient()
        await client.join()

        await client.sendMove(1, -1)
        await client.sendInput('jump')

        host.flushInputs()

        const inputs = host.flushInputs()
        expect(inputs.get('player1').moveX).toBe(1)
        expect(inputs.get('player1').moveY).toBe(-1)
        expect(inputs.get('player1').actions).toEqual([])
    })


    test('input rejects unknown player', async () => {
        const host = createHost()
        const clientTransport = host.addLocalTransport('unknown')
        const client = new SessionClient({transport: clientTransport, peerId: 'unknown'})

        await expect(client.sendInput('jump')).rejects.toThrow()
    })


    test('ping returns server time', async () => {
        const {client} = createHostWithClient()

        const result = await client.ping()

        expect(result.rtt).toBeTypeOf('number')
        expect(result.serverTime).toBeTypeOf('number')
    })


    test('removePeer cleans up player and inputs', async () => {
        const {host, client} = createHostWithClient()
        await client.join()

        host.removePeer('player1')

        expect(host.players.has('player1')).toBe(false)
        expect(host.inputQueues.has('player1')).toBe(false)
    })


    test('broadcastState sends state event to client', async () => {
        const {host, client} = createHostWithClient()
        await client.join()

        const states = []
        client.on('host:state', (state) => {
            states.push(state)
        })

        host.broadcastState({test: true})

        expect(states.length).toBe(1)
        expect(states[0]).toEqual({test: true})
    })


    test('has reportStats registered', () => {
        const host = new SessionHost()
        expect(host.actions.has('reportStats')).toBe(true)
    })


    test('reportStats stores peer stats', async () => {
        const {host, client} = createHostWithClient()
        await client.join()

        await client.reportStats({rtt: 42, connectionScore: 90})

        expect(host.peerStats.has('player1')).toBe(true)
        expect(host.peerStats.get('player1').rtt).toBe(42)
        expect(host.peerStats.get('player1').connectionScore).toBe(90)
    })


    test('reportStats emits peer:stats event', async () => {
        const {host, client} = createHostWithClient()
        await client.join()

        const events = []
        host.on('peer:stats', (peerId, stats) => {
            events.push({peerId, stats})
        })

        await client.reportStats({rtt: 42})

        expect(events.length).toBe(1)
        expect(events[0].peerId).toBe('player1')
        expect(events[0].stats.rtt).toBe(42)
    })


    test('removePeer cleans up peerStats', async () => {
        const {host, client} = createHostWithClient()
        await client.join()
        await client.reportStats({rtt: 42})

        host.removePeer('player1')

        expect(host.peerStats.has('player1')).toBe(false)
    })


    test('activate starts heartbeat', () => {
        vi.useFakeTimers()
        const host = new SessionHost()

        host.activate()

        expect(host.heartbeatTimer).not.toBe(null)
        host.deactivate()
        vi.useRealTimers()
    })


    test('deactivate stops heartbeat', () => {
        vi.useFakeTimers()
        const host = new SessionHost()

        host.activate()
        host.deactivate()

        expect(host.heartbeatTimer).toBe(null)
        vi.useRealTimers()
    })


    test('heartbeat sends to clients', async () => {
        vi.useFakeTimers()
        const {host, client} = createHostWithClient()
        await client.join()

        const heartbeats = []
        client.on('host:heartbeat', (data) => {
            heartbeats.push(data)
        })

        host.startHeartbeat()
        vi.advanceTimersByTime(1000)

        expect(heartbeats.length).toBe(1)
        expect(heartbeats[0]).toHaveProperty('timestamp')
        expect(heartbeats[0]).toHaveProperty('peerScores')

        host.stopHeartbeat()
        vi.useRealTimers()
    })


    test('heartbeat includes peer scores', async () => {
        vi.useFakeTimers()
        const {host, client} = createHostWithClient()
        await client.join()
        await client.reportStats({connectionScore: 85, performanceScore: 90})

        const heartbeats = []
        client.on('host:heartbeat', (data) => {
            heartbeats.push(data)
        })

        host.startHeartbeat()
        vi.advanceTimersByTime(1000)

        expect(heartbeats[0].peerScores.player1.connectionScore).toBe(85)
        expect(heartbeats[0].peerScores.player1.performanceScore).toBe(90)

        host.stopHeartbeat()
        vi.useRealTimers()
    })


    test('broadcastState stores lastState', () => {
        const host = createHost()
        host.broadcastState({score: 42})
        expect(host.lastState).toEqual({score: 42})
    })


    test('provideState stores state when host has none', async () => {
        const {host, client} = createHostWithClient()
        await client.join()

        await client.provideState({score: 10})

        expect(host.lastState).toEqual({score: 10})
    })


    test('provideState emits state:recovered', async () => {
        const {host, client} = createHostWithClient()
        await client.join()

        const events = []
        host.on('state:recovered', (state) => events.push(state))

        await client.provideState({score: 10})

        expect(events.length).toBe(1)
        expect(events[0]).toEqual({score: 10})
    })


    test('provideState ignores when host already has state', async () => {
        const {host, client} = createHostWithClient()
        await client.join()

        host.broadcastState({score: 42})

        const events = []
        host.on('state:recovered', (state) => events.push(state))

        await client.provideState({score: 10})

        expect(host.lastState).toEqual({score: 42})
        expect(events.length).toBe(0)
    })


    test('addPeer registers peer connection as source', async () => {
        const host = createHost()

        const listeners = {}
        const sentMessages = []
        const mockPeerConnection = {
            on: (event, handler) => {
                listeners[event] = handler
            },
            send: (msg) => {
                sentMessages.push(msg)
            }
        }

        host.addPeer('peer1', mockPeerConnection)

        listeners.message({
            type: 'service-request',
            request: {id: 1, action: 'ping', params: {}}
        })

        expect(sentMessages.length).toBe(1)
        expect(sentMessages[0].type).toBe('service-response')
    })

})
