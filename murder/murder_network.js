import PerkyModule from '../core/perky_module.js'
import MurderClient from './murder_client.js'
import PeerConnection from './peer_connection.js'
import logger from '../core/logger.js'


const HELLO_INTERVAL = 1000


export default class MurderNetwork extends PerkyModule {

    static $category = 'murderNetwork'
    static $name = 'murderNetwork'
    static $eagerStart = false

    constructor (options = {}) {
        super(options)
        this.rtcConfig = options.rtcConfig || undefined
        this.helloInterval = null
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


    get hasPeers () {
        return this.peers.some(peer => peer.channelReady)
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

        client.on('identified', (userId) => {
            this.emit('identified', userId)
        })

        client.on('disconnected', () => {
            this.stopHello()
            this.emit('disconnected')
        })

        await client.connect()

        this.startHello()
    }


    startHello () {
        this.stopHello()
        this.client?.sendSignal({type: 'hello'})

        this.helloInterval = setInterval(() => {
            if (this.hasPeers) {
                this.stopHello()
                return
            }
            this.client?.sendSignal({type: 'hello'})
        }, HELLO_INTERVAL)
    }


    stopHello () {
        if (this.helloInterval) {
            clearInterval(this.helloInterval)
            this.helloInterval = null
        }
    }


    disconnect () {
        this.stopHello()
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


function removePeer (network, peerId) {
    const peer = getPeer(network, peerId)
    if (peer) {
        peer.close()
        network.removeChild(peer.$id)
    }
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
        removePeer(network, peerId)
        network.emit('peer:disconnected', peerId)
        network.startHello()
    })

    peer.on('channel:open', () => {
        network.stopHello()
        network.emit('peer:ready', peerId, peer)
    })

    peer.on('message', (data) => {
        network.emit('message', peerId, data)
    })

    return peer
}


function handleSignal (network, signal) {
    const peerId = signal.from

    if (peerId === network.userId) {
        return
    }

    if (signal.type === 'hello') {
        handleHello(network, peerId)
        return
    }

    if (signal.to && signal.to !== network.userId) {
        return
    }

    const peer = getOrCreatePeer(network, peerId)

    if (signal.type === 'offer') {
        peer.handleOffer(signal.payload, (data) => network.client.sendSignal(data)).catch(handleError)
    } else if (signal.type === 'answer') {
        peer.handleAnswer(signal.payload).catch(handleError)
    } else if (signal.type === 'ice') {
        peer.handleIce(signal.payload)
    }
}


function handleHello (network, peerId) {
    const existing = getPeer(network, peerId)

    if (existing && existing.channelReady) {
        return
    }

    if (existing) {
        removePeer(network, peerId)
    }

    if (network.userId < peerId) {
        const peer = getOrCreatePeer(network, peerId)
        peer.createOffer((data) => network.client.sendSignal(data)).catch(handleError)
    } else {
        network.client?.sendSignal({type: 'hello'})
    }
}


function handleError (error) {
    logger.error('[MurderNetwork]', error)
}
