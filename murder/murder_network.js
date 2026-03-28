import PerkyModule from '../core/perky_module.js'
import MurderClient from './murder_client.js'
import PeerConnection from './peer_connection.js'


export default class MurderNetwork extends PerkyModule {

    static $category = 'murderNetwork'
    static $name = 'murderNetwork'
    static $eagerStart = false

    constructor (options = {}) {
        super(options)
        this.rtcConfig = options.rtcConfig || undefined
    }


    get client () {
        return this.getChild('murderClient')
    }


    get userId () {
        return this.client?.userId
    }


    get peers () {
        return this.childrenByCategory('peerConnection')
    }


    get peerIds () {
        return this.peers.map(peer => peer.peerId)
    }


    async connect (options = {}) {
        const client = this.create(MurderClient, {
            $id: 'murderClient',
            host: options.host || '',
            lobbyToken: options.lobbyToken || '',
            protocol: options.protocol || 'wss:'
        })

        client.on('signal', (signal) => {
            handleSignal(this, signal)
        })

        client.on('disconnected', () => {
            this.emit('disconnected')
        })

        await client.connect()

        client.sendSignal({type: 'hello'})
        client.on('identified', (userId) => {
            this.emit('identified', userId)
        })
    }


    disconnect () {
        this.peers.forEach(peer => peer.close())
        this.client?.disconnect()
    }


    send (peerId, data) {
        const peer = getPeer(this, peerId)
        if (!peer) {
            return false
        }
        return peer.send(data)
    }


    broadcast (data) {
        this.peers.forEach(peer => peer.send(data))
    }


    getPeer (peerId) {
        return getPeer(this, peerId)
    }


    onStop () {
        this.disconnect()
    }

}


function getPeer (network, peerId) {
    return network.getChild(`peer_${peerId}`) || null
}


function getOrCreatePeer (network, peerId) {
    const existing = getPeer(network, peerId)
    if (existing) {
        return existing
    }

    const peer = network.create(PeerConnection, {
        $id: `peer_${peerId}`,
        $name: `peer_${peerId}`,
        peerId,
        rtcConfig: network.rtcConfig
    })

    peer.on('ice', (candidate) => {
        network.client.sendSignal({type: 'ice', to: peerId, payload: candidate})
    })

    peer.on('connected', () => {
        network.emit('peer:connected', peerId, peer)
    })

    peer.on('disconnected', () => {
        network.emit('peer:disconnected', peerId, peer)
        network.removeChild(peer.$id)
    })

    peer.on('channel:open', () => {
        network.emit('peer:ready', peerId, peer)
    })

    peer.on('message', (data) => {
        network.emit('message', peerId, data)
    })

    return peer
}


function sendSignal (network, data) {
    network.client.sendSignal(data)
}


function handleSignal (network, signal) {
    const peerId = signal.from
    if (peerId === network.userId) {
        return
    }

    if (signal.type === 'hello') {
        if (network.userId < peerId) {
            const peer = getOrCreatePeer(network, peerId)
            peer.createOffer((data) => sendSignal(network, data))
        }
        return
    }

    if (signal.to && signal.to !== network.userId) {
        return
    }

    const peer = getOrCreatePeer(network, peerId)

    if (signal.type === 'offer') {
        peer.handleOffer(signal.payload, (data) => sendSignal(network, data))
    } else if (signal.type === 'answer') {
        peer.handleAnswer(signal.payload)
    } else if (signal.type === 'ice') {
        peer.handleIce(signal.payload)
    }
}
