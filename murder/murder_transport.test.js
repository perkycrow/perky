import createMurderTransport from './murder_transport.js'
import ServiceTransport from '../service/service_transport.js'
import {vi} from 'vitest'


function createMockPeer () {
    const listeners = {}

    return {
        peerId: 1,
        channelReady: true,
        send: vi.fn(),
        on (event, callback) {
            if (!listeners[event]) {
                listeners[event] = []
            }
            listeners[event].push(callback)
        },
        emit (event, ...args) {
            const cbs = listeners[event]
            if (cbs) {
                cbs.forEach(cb => cb(...args))
            }
        }
    }
}


describe('createMurderTransport', () => {

    test('returns a ServiceTransport', () => {
        const peer = createMockPeer()
        const transport = createMurderTransport(peer)
        expect(transport).toBeInstanceOf(ServiceTransport)
    })


    test('send calls peer.send', () => {
        const peer = createMockPeer()
        const transport = createMurderTransport(peer)

        const message = {type: 'service-request', request: {id: '1', action: 'test'}}
        transport.send(message)

        expect(peer.send).toHaveBeenCalledWith(message)
    })


    test('receives service-request messages', () => {
        const peer = createMockPeer()
        const transport = createMurderTransport(peer)
        const handler = vi.fn()

        transport.onMessage(handler)

        const message = {type: 'service-request', request: {id: '1', action: 'test'}}
        peer.emit('message', message)

        expect(handler).toHaveBeenCalledWith(message)
    })


    test('receives service-response messages', () => {
        const peer = createMockPeer()
        const transport = createMurderTransport(peer)
        const handler = vi.fn()

        transport.onMessage(handler)

        const message = {type: 'service-response', response: {requestId: '1', success: true}}
        peer.emit('message', message)

        expect(handler).toHaveBeenCalledWith(message)
    })


    test('receives service-event messages', () => {
        const peer = createMockPeer()
        const transport = createMurderTransport(peer)
        const handler = vi.fn()

        transport.onMessage(handler)

        const message = {type: 'service-event', eventName: 'update', args: []}
        peer.emit('message', message)

        expect(handler).toHaveBeenCalledWith(message)
    })


    test('ignores non-service messages', () => {
        const peer = createMockPeer()
        const transport = createMurderTransport(peer)
        const handler = vi.fn()

        transport.onMessage(handler)

        peer.emit('message', {type: 'game-data', payload: 'move'})
        peer.emit('message', {action: 'attack', x: 10})

        expect(handler).not.toHaveBeenCalled()
    })


    test('ignores null messages', () => {
        const peer = createMockPeer()
        const transport = createMurderTransport(peer)
        const handler = vi.fn()

        transport.onMessage(handler)

        peer.emit('message', null)

        expect(handler).not.toHaveBeenCalled()
    })


    test('multiple handlers', () => {
        const peer = createMockPeer()
        const transport = createMurderTransport(peer)
        const handler1 = vi.fn()
        const handler2 = vi.fn()

        transport.onMessage(handler1)
        transport.onMessage(handler2)

        const message = {type: 'service-request', request: {id: '1', action: 'test'}}
        peer.emit('message', message)

        expect(handler1).toHaveBeenCalledWith(message)
        expect(handler2).toHaveBeenCalledWith(message)
    })

})
