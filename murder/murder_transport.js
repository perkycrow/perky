import ServiceTransport from '../service/service_transport.js'


const SERVICE_MESSAGE_TYPES = new Set([
    'service-request',
    'service-response',
    'service-event'
])


function isServiceMessage (data) {
    return data && SERVICE_MESSAGE_TYPES.has(data.type)
}


export default function createMurderTransport (peerConnection) {
    const handlers = []

    peerConnection.on('message', (data) => {
        if (isServiceMessage(data)) {
            handlers.forEach(handler => handler(data))
        }
    })

    return new ServiceTransport({
        send: (message) => peerConnection.send(message),
        receive: (handler) => handlers.push(handler)
    })
}
