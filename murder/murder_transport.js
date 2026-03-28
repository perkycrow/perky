import ServiceTransport from '../service/service_transport.js'


export default function createMurderTransport (peerConnection) {
    const handlers = []

    peerConnection.on('message', (data) => {
        if (data && (data.type === 'service-request' || data.type === 'service-response' || data.type === 'service-event')) {
            handlers.forEach(handler => handler(data))
        }
    })

    return new ServiceTransport({
        send: (message) => peerConnection.send(message),
        receive: (handler) => handlers.push(handler)
    })
}
