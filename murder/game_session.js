import PerkyModule from '../core/perky_module.js'
import MurderNetwork from './murder_network.js'
import SessionHost from './session_host.js'
import SessionClient from './session_client.js'
import createMurderTransport from './murder_transport.js'
import PingMonitor from './ping_monitor.js'
import PerformanceMonitor from './performance_monitor.js'


const HEARTBEAT_TIMEOUT = 5000
const WAITING_TIMEOUT = 15000


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
        this.waiting = false

        this.pingMonitor = null
        this.performanceMonitor = new PerformanceMonitor()

        this.lastHeartbeat = 0
        this.heartbeatCheckTimer = null
        this.waitingTimer = null
        this.lastPeerScores = {}
        this.lastState = loadPersistedState(this.lobbyToken)
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
        if (!this.connected || !this.sessionClient) {
            return
        }

        try {
            return await this.sessionClient.sendInput(action, value)
        } catch {
            return undefined
        }
    }


    async sendMove (moveX) {
        if (!this.connected || !this.sessionClient) {
            return
        }

        try {
            return await this.sessionClient.sendMove(moveX)
        } catch {
            return undefined
        }
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
        updateLastState(this, state)
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
        clearInterval(this.heartbeatCheckTimer)
        clearTimeout(this.waitingTimer)
        this.heartbeatCheckTimer = null
        this.waitingTimer = null
        this.waiting = false
        this.network?.disconnect()
        this.connected = false
    }


    onStop () {
        this.disconnect()
    }

}


function handlePeerReady (session, peerId) {
    const wasDisconnected = session.waiting || !session.connected

    exitWaitingState(session)

    const host = session.sessionHost

    if (session.connected) {
        host.deactivate()
        host.stopHeartbeat()
        teardownClient(session)
    }

    const peer = session.network.getPeer(peerId)
    host.addPeer(peerId, peer)

    electHostByScore(session, peerId)

    if (session.isHost) {
        activateAsHost(session)
    } else {
        activateAsClient(session, peerId)
    }

    if (wasDisconnected) {
        session.emit('host:recovered')
    }

    sendRecoveryState(session)
}


function handlePeerDisconnected (session, peerId) {
    session.sessionHost?.removePeer(peerId)

    const lostHost = peerId === session.hostPlayerId && !session.isHost

    if (lostHost) {
        enterWaitingState(session)
    } else {
        session.emit('peer:disconnected', peerId)
    }
}


function teardownClient (session) {
    const client = session.sessionClient
    if (client) {
        session.removeChild(client.$id)
    }
}


function sendRecoveryState (session) {
    if (!session.lastState || !session.sessionClient) {
        return
    }
    session.sessionClient.provideState(session.lastState).catch(() => {})
}


function activateAsHost (session) {
    const host = session.sessionHost
    host.activate()

    host.on('peer:stats', (peerId, stats) => {
        session.emit('peer:stats', peerId, stats)
    })

    host.on('state:recovered', (state) => {
        updateLastState(session, state)
        session.emit('state:recovered', state)
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
        updateLastState(session, state)
        session.emit('state', state)
    })

    client.join().then(({slot}) => {
        session.playerSlots.set(session.localPlayerId, slot)
        session.emit('player:joined', session.localPlayerId, slot)
    })

    startHeartbeatCheck(session, client)
    startPingMonitor(session, client)
}


function enterWaitingState (session) {
    session.connected = false
    session.waiting = true
    session.pingMonitor?.stop()
    teardownClient(session)
    clearInterval(session.heartbeatCheckTimer)
    session.heartbeatCheckTimer = null

    forceDisconnectPeers(session)

    session.emit('host:lost')

    session.waitingTimer = setTimeout(() => {
        session.waiting = false
        session.waitingTimer = null
        session.emit('host:timeout')
    }, WAITING_TIMEOUT)
}


function forceDisconnectPeers (session) {
    const network = session.network
    if (!network) {
        return
    }

    for (const peer of [...network.peers]) {
        peer.close()
        network.removeChild(peer.$id)
    }

    network.startHello()
}


function exitWaitingState (session) {
    session.waiting = false
    clearTimeout(session.waitingTimer)
    session.waitingTimer = null
}


function startHeartbeatCheck (session, client) {
    session.lastHeartbeat = Date.now()

    client.on('host:heartbeat', (data) => {
        session.lastHeartbeat = Date.now()
        session.lastPeerScores = data.peerScores || {}
    })

    if (session.isHost) {
        return
    }

    session.heartbeatCheckTimer = setInterval(() => {
        const elapsed = Date.now() - session.lastHeartbeat

        if (elapsed > HEARTBEAT_TIMEOUT && session.connected && !session.waiting) {
            enterWaitingState(session)
        }
    }, 1000)
}


function electHostByScore (session, peerId) {
    const localScore = computeCandidateScore(
        session.lastPeerScores[session.localPlayerId]
    )
    const peerScore = computeCandidateScore(
        session.lastPeerScores[peerId]
    )

    if (localScore !== peerScore) {
        session.hostPlayerId = localScore > peerScore
            ? session.localPlayerId
            : peerId
    } else {
        session.hostPlayerId = session.localPlayerId < peerId
            ? session.localPlayerId
            : peerId
    }

    session.emit('host:elected', session.hostPlayerId)
}


function computeCandidateScore (stats) {
    if (!stats) {
        return 0
    }
    return (stats.connectionScore || 0) * 0.5 + (stats.performanceScore || 0) * 0.5
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


function updateLastState (session, state) {
    session.lastState = state
    persistState(session.lobbyToken, state)
}


function persistState (lobbyToken, state) {
    if (!lobbyToken || typeof localStorage === 'undefined') {
        return
    }

    try {
        localStorage.setItem(`murder:state:${lobbyToken}`, JSON.stringify(state))
    } catch {
        // storage full or unavailable
    }
}


function loadPersistedState (lobbyToken) {
    if (!lobbyToken || typeof localStorage === 'undefined') {
        return null
    }

    try {
        const raw = localStorage.getItem(`murder:state:${lobbyToken}`)
        return raw ? JSON.parse(raw) : null
    } catch {
        return null
    }
}
