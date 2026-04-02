import PerkyModule from '../core/perky_module.js'
import MurderNetwork from './murder_network.js'
import SessionHost from './session_host.js'
import SessionClient from './session_client.js'
import createMurderTransport from './murder_transport.js'
import PingMonitor from './ping_monitor.js'
import PerformanceMonitor from './performance_monitor.js'


export default class GameSession extends PerkyModule {

    static $name = 'gameSession'
    static $eagerStart = false

    constructor (options = {}) {
        super(options)

        this.serverHost = options.serverHost || ''
        this.lobbyToken = options.lobbyToken || ''
        this.protocol = options.protocol || 'wss:'

        this.localPlayerId = null
        this.hostPlayerId = null
        this.playerSlots = new Map()
        this.connected = false

        this.pingMonitor = null
        this.performanceMonitor = new PerformanceMonitor()
    }


    get isHost () {
        return this.hostPlayerId !== null && this.localPlayerId === this.hostPlayerId
    }


    get stats () {
        return {
            ...(this.pingMonitor ? this.pingMonitor.stats : {}),
            ...this.performanceMonitor.stats
        }
    }


    get peerStats () {
        return this.sessionHost?.peerStats || new Map()
    }


    get sessionHost () {
        return this.getChild('sessionHost')
    }


    get sessionClient () {
        return this.getChild('sessionClient')
    }


    get network () {
        return this.getChild('network')
    }


    async connect () {
        const network = this.create(MurderNetwork, {
            $id: 'network'
        })

        this.create(SessionHost, {$id: 'sessionHost'})

        network.on('identified', (userId) => {
            this.localPlayerId = userId
        })

        network.on('peer:ready', (peerId) => {
            handlePeerReady(this, peerId)
        })

        network.on('peer:disconnected', (peerId) => {
            handlePeerDisconnected(this, peerId)
        })

        await network.connect({
            host: this.serverHost,
            lobbyToken: this.lobbyToken,
            protocol: this.protocol
        })
    }


    async sendInput (action, value) {
        if (!this.sessionClient) {
            return
        }
        return this.sessionClient.sendInput(action, value)
    }


    async sendMove (moveX) {
        if (!this.sessionClient) {
            return
        }
        return this.sessionClient.sendMove(moveX)
    }


    tick (timestamp) {
        this.performanceMonitor.tick(timestamp)
    }


    flushInputs () {
        if (!this.sessionHost) {
            return new Map()
        }
        return this.sessionHost.flushInputs()
    }


    broadcastState (state) {
        if (!this.sessionHost) {
            return
        }
        this.sessionHost.broadcastState(state)
    }


    getSlot (peerId) {
        return this.playerSlots.get(peerId) ?? -1
    }


    disconnect () {
        this.pingMonitor?.stop()
        this.pingMonitor = null
        this.network?.disconnect()
        this.connected = false
    }


    onStop () {
        this.disconnect()
    }

}


function handlePeerReady (session, peerId) {
    const host = session.sessionHost
    const peer = session.network.getPeer(peerId)

    host.addPeer(peerId, peer)
    electHost(session, peerId)

    if (session.connected) {
        teardownClient(session)
    }

    if (session.isHost) {
        activateAsHost(session)
    } else {
        activateAsClient(session, peerId)
    }
}


function handlePeerDisconnected (session, peerId) {
    session.sessionHost?.removePeer(peerId)
    session.connected = false
    session.hostPlayerId = null
    teardownClient(session)
    session.emit('peer:disconnected', peerId)
}


function teardownClient (session) {
    const client = session.sessionClient
    if (client) {
        session.removeChild(client.$id)
    }
}


function electHost (session, peerId) {
    session.hostPlayerId = session.localPlayerId < peerId
        ? session.localPlayerId
        : peerId

    session.emit('host:elected', session.hostPlayerId)
}


function activateAsHost (session) {
    const host = session.sessionHost
    host.activate()

    host.on('peer:stats', (peerId, stats) => {
        session.emit('peer:stats', peerId, stats)
    })

    const localTransport = host.addLocalTransport(session.localPlayerId)
    setupClient(session, localTransport)

    session.connected = true
    session.emit('connected', {role: 'host'})
}


function activateAsClient (session, hostPeerId) {
    const peer = session.network.getPeer(hostPeerId)
    if (!peer) {
        return
    }

    const transport = createMurderTransport(peer)
    setupClient(session, transport)

    session.connected = true
    session.emit('connected', {role: 'client'})
}


function setupClient (session, transport) {
    const client = session.create(SessionClient, {
        $id: 'sessionClient',
        transport,
        peerId: session.localPlayerId
    })

    client.on('host:state', (state) => {
        session.emit('state', state)
    })

    client.join().then(({slot}) => {
        session.playerSlots.set(session.localPlayerId, slot)
        session.emit('player:joined', session.localPlayerId, slot)
    })

    startPingMonitor(session, client)
}


function startPingMonitor (session, client) {
    session.pingMonitor?.stop()

    session.pingMonitor = new PingMonitor(
        () => client.ping(),
        {
            onStats: (stats) => {
                const combined = {...stats, ...session.performanceMonitor.stats}
                session.emit('stats', combined)
                client.reportStats(combined).catch(() => {})
            }
        }
    )

    session.pingMonitor.start()
}
