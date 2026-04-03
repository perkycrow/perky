import {doc, section, text, code} from '../doc/runtime.js'


export default doc('MurderClient', {advanced: true}, () => {

    text(`
        Low-level WebSocket connection to the Murder server's SignalingChannel.
        Handles the ActionCable protocol for subscribing to a lobby and
        exchanging WebRTC signaling messages. Usually managed by MurderNetwork
        rather than used directly.
    `)


    section('Connecting', () => {

        text(`
            Create a client with server host and lobby token, then call
            \`connect()\`. The client subscribes to the lobby's signaling
            channel and receives a user ID.
        `)

        code('Basic connection', async () => {
            const client = game.create(MurderClient, {
                host: 'murder.example.com',
                lobbyToken: 'abc123',
                protocol: 'wss:'
            })

            client.on('identified', (userId) => {
                // Server assigned your user ID
            })

            await client.connect()
        })

    })


    section('Sending Signals', () => {

        text(`
            Use \`sendSignal()\` to send WebRTC signaling data through the
            server. The signal is relayed to other players in the lobby.
        `)

        code('Send a signal', () => {
            // client.sendSignal({type: 'offer', to: peerId, payload: offer})
            // client.sendSignal({type: 'answer', to: peerId, payload: answer})
            // client.sendSignal({type: 'ice', to: peerId, payload: candidate})
            // client.sendSignal({type: 'hello'})
        })

    })


    section('Events', () => {

        text(`
            Key events:
            - \`subscribed\` — Successfully subscribed to the lobby channel
            - \`identified\` — Server assigned your user ID
            - \`signal\` — Received a signaling message from another player
            - \`disconnected\` — WebSocket connection closed
        `)

    })


    section('Properties', () => {

        text(`
            - \`connected\` — Whether the WebSocket is open
            - \`userId\` — Your assigned user ID (set after \`identified\`)
            - \`serverHost\` — The Murder server hostname
            - \`lobbyToken\` — The lobby to join
            - \`protocol\` — WebSocket protocol (\`ws:\` or \`wss:\`)
        `)

    })

})
