import {doc, section, text, code} from '../doc/runtime.js'


export default doc('MurderTransport', {advanced: true}, () => {

    text(`
        Bridges a PeerConnection to a ServiceTransport, allowing you to
        use ServiceClient and ServiceHost over WebRTC. Filters incoming
        messages to only pass through service-related types.
    `)


    section('Creating a Transport', () => {

        text(`
            Call \`createMurderTransport()\` with a PeerConnection to get
            a ServiceTransport. Then use it with ServiceClient or ServiceHost
            for RPC over peer-to-peer connections.
        `)

        code('Client-side RPC', () => {
            // const transport = createMurderTransport(peerConnection)
            // const client = new ServiceClient({transport})
            // const result = await client.request('getState')
        })

        code('Host-side RPC', () => {
            // const transport = createMurderTransport(peerConnection)
            // const host = new ServiceHost({transport})
            // host.handle('getState', () => gameState)
        })

    })


    section('Message Filtering', () => {

        text(`
            The transport only passes messages with these types:
            - \`service-request\` — RPC request from client
            - \`service-response\` — RPC response from host
            - \`service-event\` — Event broadcast

            Other messages on the PeerConnection are ignored, so game
            data and service RPC can coexist on the same connection.
        `)

    })

})
