import {doc, section, text, code} from '../doc/runtime.js'


export default doc('SessionClient', {advanced: true}, () => {

    text(`
        Client-side RPC wrapper for communicating with a SessionHost. Extends
        ServiceClient to provide game-specific methods for joining, sending
        inputs, and reporting stats over a WebRTC transport.
    `)


    section('Usage', () => {

        text(`
            Create a SessionClient with a transport and peer ID. The client
            sends requests to the host, which processes them and returns
            responses.
        `)

        code('Basic setup', () => {
            const client = new SessionClient({
                transport: murderTransport,
                peerId: 'player-123'
            })

            await client.join()
        })

    })


    section('Joining', () => {

        text(`
            Call \`join()\` to register with the host. The host assigns a
            player slot and adds the peer to the session.
        `)

        code('Join a session', () => {
            // const result = await client.join()
            // result.slot — assigned player slot index
        })

    })


    section('Sending Inputs', () => {

        text(`
            Use \`sendInput()\` to send arbitrary input actions, or
            \`sendMove()\` for movement shortcuts. Each input is tagged
            with an auto-incrementing sequence number for ordering.
        `)

        code('Input methods', () => {
            // await client.sendInput('attack', {target: 'enemy1'})
            // await client.sendInput('jump', true)
            // await client.sendMove(1) // move right
            // await client.sendMove(-1) // move left
        })

    })


    section('Ping', () => {

        text(`
            Call \`ping()\` to measure round-trip time to the host. Returns
            the RTT in milliseconds and the host's server time.
        `)

        code('Measure latency', () => {
            // const {rtt, serverTime} = await client.ping()
        })

    })


    section('Stats Reporting', () => {

        text(`
            Use \`reportStats()\` to send performance and connection metrics
            to the host. The host uses these for host election scoring.
        `)

        code('Report stats', () => {
            // await client.reportStats({
            //     ping: 45,
            //     jitter: 5,
            //     fps: 60,
            //     performanceScore: 95
            // })
        })

    })


    section('State Recovery', () => {

        text(`
            When the host requests state recovery (e.g., after a reconnection),
            use \`provideState()\` to send your cached state back.
        `)

        code('Provide state', () => {
            // await client.provideState(cachedGameState)
        })

    })

})
