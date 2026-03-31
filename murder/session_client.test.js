import {describe, test, expect, vi} from 'vitest'
import SessionClient from './session_client.js'
import SessionHost from './session_host.js'
import ServiceClient from '../service/service_client.js'
import ServiceTransport from '../service/service_transport.js'


function createConnectedPair () {
    const host = new SessionHost()
    host.activate()

    const clientTransport = host.addLocalTransport('player1')

    const client = new SessionClient({
        transport: clientTransport,
        peerId: 'player1'
    })

    return {host, client}
}


describe('SessionClient', () => {

    test('extends ServiceClient', () => {
        const transport = ServiceTransport.local()
        const client = new SessionClient({transport})
        expect(client).toBeInstanceOf(ServiceClient)
    })


    test('stores peerId', () => {
        const transport = ServiceTransport.local()
        const client = new SessionClient({transport, peerId: 'abc'})
        expect(client.peerId).toBe('abc')
    })


    test('join sends peerId and returns slot', async () => {
        const {client} = createConnectedPair()

        const result = await client.join()

        expect(result.slot).toBe(0)
        expect(result.playerCount).toBe(1)
    })


    test('sendInput sends action to host', async () => {
        const {host, client} = createConnectedPair()
        await client.join()

        await client.sendInput('jump')

        const inputs = host.flushInputs()
        expect(inputs.get('player1').actions).toContain('jump')
    })


    test('sendMove sends move value to host', async () => {
        const {host, client} = createConnectedPair()
        await client.join()

        await client.sendMove(-1)

        const inputs = host.flushInputs()
        expect(inputs.get('player1').moveX).toBe(-1)
    })


    test('ping returns rtt and server time', async () => {
        const {client} = createConnectedPair()

        const result = await client.ping()

        expect(result.rtt).toBeTypeOf('number')
        expect(result.rtt).toBeGreaterThanOrEqual(0)
        expect(result.serverTime).toBeTypeOf('number')
    })


    test('receives state events from host', async () => {
        const {host, client} = createConnectedPair()
        await client.join()

        const states = []
        client.on('host:state', (state) => {
            states.push(state)
        })

        host.broadcastState({score: 42})

        expect(states.length).toBe(1)
        expect(states[0]).toEqual({score: 42})
    })

})
