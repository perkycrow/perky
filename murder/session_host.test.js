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
    })


    test('input stores one-shot actions', async () => {
        const {host, client} = createHostWithClient()
        await client.join()

        await client.sendInput('jump')
        await client.sendInput('lunge')

        const inputs = host.flushInputs()
        expect(inputs.get('player1').actions).toEqual(['jump', 'lunge'])
    })


    test('flushInputs clears actions but preserves moveX', async () => {
        const {host, client} = createHostWithClient()
        await client.join()

        await client.sendMove(1)
        await client.sendInput('jump')

        host.flushInputs()

        const inputs = host.flushInputs()
        expect(inputs.get('player1').moveX).toBe(1)
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

})
