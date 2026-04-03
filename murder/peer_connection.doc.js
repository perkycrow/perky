import {doc, section, text, code} from '../doc/runtime.js'


export default doc('PeerConnection', {advanced: true}, () => {

    text(`
        Wraps a single RTCPeerConnection and its data channel for peer-to-peer
        communication. Handles WebRTC offer/answer/ICE negotiation. Usually
        managed by MurderNetwork rather than used directly.
    `)


    section('Creating a Connection', () => {

        text(`
            PeerConnection manages the WebRTC handshake. The initiating peer
            calls \`createOffer()\`, the receiving peer handles it with
            \`handleOffer()\`, then the initiator completes with \`handleAnswer()\`.
        `)

        code('Initiating a connection', async () => {
            const peer = game.create(PeerConnection, {
                peerId: 'player-5',
                rtcConfig: {iceServers: [{urls: 'stun:stun.l.google.com:19302'}]}
            })

            peer.on('ice', (candidate) => {
                // sendSignal({type: 'ice', to: peer.peerId, payload: candidate})
            })

            await peer.createOffer((signal) => {
                // sendSignal(signal) — sends offer to remote peer
            })
        })

    })


    section('Handling Signals', () => {

        text(`
            When receiving WebRTC signals from the other peer, call the
            appropriate handler. ICE candidates can arrive at any time during
            the handshake and are queued until the remote description is set.
        `)

        code('Signal handlers', async () => {
            // await peer.handleOffer(offer, sendSignal)  // creates and sends answer
            // await peer.handleAnswer(answer)           // completes the handshake
            // peer.handleIce(candidate)                 // adds ICE candidate
        })

    })


    section('Sending Data', () => {

        text(`
            Once connected, use \`send()\` to transmit JSON data over the
            WebRTC data channel. Returns false if the channel is not ready.
        `)

        code('Sending messages', () => {
            // peer.send({action: 'move', x: 10, y: 5})
        })

    })


    section('Events', () => {

        text(`
            Key events:
            - \`connected\` — RTCPeerConnection state became connected
            - \`disconnected\` — Connection was disconnected or failed
            - \`channel:open\` — Data channel is ready for messages
            - \`channel:close\` — Data channel closed
            - \`message\` — Received data from the remote peer
            - \`ice\` — New ICE candidate to send to the remote peer
        `)

    })


    section('Properties', () => {

        text(`
            - \`peerId\` — Identifier for the remote peer
            - \`channel\` — The underlying RTCDataChannel
            - \`channelReady\` — Whether the data channel is open
            - \`connectionState\` — Current RTCPeerConnection state
            - \`simulatedLatency\` — Artificial delay for testing (ms)
        `)

    })

})
