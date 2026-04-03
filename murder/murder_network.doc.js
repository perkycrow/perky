import {doc, section, text, code} from '../doc/runtime.js'


export default doc('MurderNetwork', {advanced: true}, () => {

    text(`
        The main entry point for peer-to-peer multiplayer. Orchestrates
        signaling through MurderClient and manages PeerConnection instances
        as a PerkyModule tree. Once peers are connected via WebRTC, all
        game data flows directly between players.
    `)


    section('Connecting', () => {

        text(`
            Create a MurderNetwork and call \`connect()\` with server host
            and lobby token. The network handles signaling and peer discovery
            automatically.
        `)

        code('Basic setup', async () => {
            const network = game.create(MurderNetwork)

            network.on('peer:connected', (peerId, peer) => {
                // A new peer has connected
            })

            network.on('message', (peerId, data) => {
                // Received data from a peer
            })

            await network.connect({
                host: 'murder.example.com',
                lobbyToken: 'abc123',
                protocol: 'wss:'
            })
        })

    })


    section('Sending Messages', () => {

        text(`
            Use \`send()\` for direct messages to a specific peer, or
            \`broadcast()\` to send to all connected peers. Messages are
            sent over WebRTC data channels, bypassing the server.
        `)

        code('Messaging', () => {
            // network.send(peerId, {action: 'move', x: 10, y: 5})
            // network.broadcast({action: 'sync', state: gameState})
        })

    })


    section('Events', () => {

        text(`
            Key events:
            - \`identified\` — Server assigned your user ID
            - \`peer:connected\` — A peer's WebRTC connection opened
            - \`peer:ready\` — A peer's data channel is ready
            - \`peer:disconnected\` — A peer disconnected
            - \`message\` — Received data from a peer
            - \`disconnected\` — Signaling connection closed
        `)

    })


    section('Properties', () => {

        text(`
            - \`client\` — The underlying MurderClient for signaling
            - \`userId\` — Your assigned user ID
            - \`peers\` — Array of connected PeerConnection instances
            - \`peerIds\` — Array of connected peer IDs
            - \`hasPeers\` — Whether any peers have open data channels
        `)

    })

})
