import {doc, section, text, code} from '../doc/runtime.js'


export default doc('GameSession', {advanced: true}, () => {

    text(`
        High-level multiplayer session manager built on MurderNetwork.
        Handles host election, automatic failover, input collection, state
        broadcasting, and player slot assignment. Use this as your game's
        single point of contact for multiplayer networking.
    `)


    section('Connecting', () => {

        text(`
            Create a GameSession with server details and call \`connect()\`.
            The session automatically creates a MurderNetwork,
            SessionHost, and SessionClient internally.
        `)

        code('Basic setup', () => {
            const session = game.create(GameSession, {
                serverHost: 'murder.example.com',
                lobbyToken: 'abc123',
                protocol: 'wss:'
            })

            session.on('connected', ({role}) => {
                // role is 'host' or 'client'
            })

            session.connect()
        })

    })


    section('Host vs Client', () => {

        text(`
            The session uses score-based host election. The player with the
            best combined connection and performance score becomes host.
            Check \`isHost\` to determine your role. The host broadcasts
            state; clients send inputs.
        `)

        code('Role-based logic', () => {
            // if (session.isHost) {
            //     const inputs = session.flushInputs()
            //     const newState = simulate(state, inputs)
            //     session.broadcastState(newState)
            // }
        })

    })


    section('Sending Inputs', () => {

        text(`
            Clients send inputs to the host via \`sendInput()\` or
            \`sendMove()\`. The host collects all inputs and returns them
            from \`flushInputs()\` as a Map keyed by player ID.
        `)

        code('Client input', () => {
            // session.sendInput('attack', {target: 'enemy1'})
            // session.sendMove(1) // move right
        })

    })


    section('State Broadcasting', () => {

        text(`
            The host calls \`broadcastState()\` to send authoritative state
            to all clients. State is also persisted to localStorage for
            recovery after reconnection.
        `)

        code('Broadcast', () => {
            // session.broadcastState({
            //     players: [...],
            //     entities: [...],
            //     tick: 42
            // })
        })

    })


    section('Events', () => {

        text(`
            Key events:
            - \`connected\` — Session ready, includes \`{role}\`
            - \`state\` — New state from host
            - \`player:joined\` — Player joined with slot
            - \`peer:disconnected\` — A peer dropped
            - \`host:lost\` — Host disconnected, waiting for recovery
            - \`host:recovered\` — New host elected
            - \`host:timeout\` — Recovery failed
            - \`stats\` — Ping and performance updates
        `)

    })


    section('Stats and Monitoring', () => {

        text(`
            Access \`stats\` for combined ping and performance metrics.
            The session automatically monitors latency via PingMonitor
            and frame timing via PerformanceMonitor.
        `)

        code('Reading stats', () => {
            // const {ping, jitter, fps, frameTime} = session.stats
        })

    })


    section('Player Slots', () => {

        text(`
            Players are assigned stable slot indices (0, 1, 2...) that
            persist across reconnections. Use \`getSlot(peerId)\` to map
            peer IDs to player positions.
        `)

    })

})
