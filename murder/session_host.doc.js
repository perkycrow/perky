import {doc, section, text, code} from '../doc/runtime.js'


export default doc('SessionHost', {advanced: true}, () => {

    text(`
        Server-side RPC handler for multiplayer sessions. Extends ServiceHost to
        manage player connections, collect inputs, broadcast state, and emit
        heartbeats. Multiplexes multiple WebRTC peer transports into a single
        service interface.
    `)


    section('Usage', () => {

        text(`
            Create a SessionHost and add peer connections as players join.
            Activate it when the game starts, then flush inputs each tick and
            broadcast state updates.
        `)

        code('Basic setup', () => {
            const host = new SessionHost()

            network.on('peer:connected', (peerId, peer) => {
                host.addPeer(peerId, peer)
            })

            network.on('peer:disconnected', (peerId) => {
                host.removePeer(peerId)
            })

            host.activate()
        })

    })


    section('Managing Peers', () => {

        text(`
            Use \`addPeer()\` to register a WebRTC peer connection. The host
            wraps it in a MurderTransport and multiplexes messages. Use
            \`addLocalTransport()\` for the local player to get a direct
            transport without WebRTC.
        `)

        code('Adding peers', () => {
            // Remote peer via WebRTC
            // host.addPeer('peer-123', peerConnection)

            // Local player (returns a transport for SessionClient)
            // const localTransport = host.addLocalTransport('local')
            // const client = new SessionClient({transport: localTransport})
        })

    })


    section('Input Collection', () => {

        text(`
            Players send inputs via the \`input\` service method. The host
            queues these per player. Call \`flushInputs()\` each game tick to
            retrieve and clear all queued inputs.
        `)

        code('Flushing inputs', () => {
            // const inputs = host.flushInputs()
            // for (const [peerId, data] of inputs) {
            //     const {moveX, actions} = data
            //     // Process player input...
            // }
        })

    })


    section('State Broadcasting', () => {

        text(`
            Call \`broadcastState()\` to send game state to all connected
            clients. The host caches the last state for recovery scenarios.
        `)

        code('Broadcast state', () => {
            // host.broadcastState({
            //     players: [...],
            //     entities: [...],
            //     tick: currentTick
            // })
        })

    })


    section('Heartbeat', () => {

        text(`
            When active, the host emits heartbeats every second with the
            current timestamp and peer scores. Clients use this for latency
            measurement and host election.
        `)

    })


    section('Service Methods', () => {

        text(`
            The host exposes these RPC methods to clients:
            - \`join\` — Register a player, assigns a slot
            - \`input\` — Queue an input action
            - \`ping\` — Return server time for latency measurement
            - \`reportStats\` — Receive peer performance metrics
            - \`provideState\` — Accept state for recovery
        `)

    })

})
