import ServiceHost from '../service/service_host.js'
import ServiceTransport from '../service/service_transport.js'
import createMurderTransport from './murder_transport.js'


export default class SessionHost extends ServiceHost {

    static $category = 'sessionHost'
    static $name = 'sessionHost'
    static $eagerStart = false
    static serviceMethods = ['join', 'input', 'ping']

    constructor (options = {}) {
        const multiplexer = createMultiplexer()

        super({...options, transport: multiplexer.transport})

        this.multiplexer = multiplexer
        this.players = new Map()
        this.inputQueues = new Map()
        this.active = false
    }


    activate () {
        this.active = true
    }


    deactivate () {
        this.active = false
    }


    addPeer (peerId, peerConnection) {
        const peerTransport = createMurderTransport(peerConnection)
        this.multiplexer.addSource(peerId, peerTransport)
    }


    removePeer (peerId) {
        this.multiplexer.removeSource(peerId)
        this.players.delete(peerId)
        this.inputQueues.delete(peerId)
    }


    addLocalTransport (peerId) {
        const [hostSide, clientSide] = ServiceTransport.pair()
        this.multiplexer.addSource(peerId, hostSide)
        return clientSide
    }


    join (req, res) {
        if (!this.active) {
            res.error('Host is not active')
            return
        }

        const peerId = req.params.peerId
        const slot = this.players.size

        this.players.set(peerId, {slot, joinedAt: Date.now()})
        this.inputQueues.set(peerId, {})

        this.emit('player:joined', peerId, slot)
        res.send({slot, playerCount: this.players.size})
    }


    input (req, res) {
        const {peerId, action, value} = req.params

        if (!this.inputQueues.has(peerId)) {
            res.error('Unknown player')
            return
        }

        const queue = this.inputQueues.get(peerId)

        if (action === 'move') {
            queue.moveX = value ?? 0
        } else {
            if (!queue.actions) {
                queue.actions = []
            }
            queue.actions.push(action)
        }

        res.send('ok')
    }


    ping (req, res) {
        res.send({serverTime: Date.now()})
    }


    flushInputs () {
        const inputs = new Map()

        for (const [peerId, queue] of this.inputQueues) {
            inputs.set(peerId, {
                moveX: queue.moveX ?? 0,
                actions: queue.actions || []
            })
            queue.actions = []
        }

        return inputs
    }


    broadcastState (state) {
        this.emitToClient('state', state)
    }

}


function createMultiplexer () {
    const handlers = new Set()

    const transport = new ServiceTransport({
        send: (message) => {
            broadcastToSources(sources, message)
        },
        receive: (handler) => {
            handlers.add(handler)
        }
    })

    const sources = new Map()

    return {
        transport,

        addSource (peerId, peerTransport) {
            sources.set(peerId, peerTransport)
            peerTransport.onMessage((message) => {
                if (message.type === 'service-request' && message.request) {
                    if (!message.request.params) {
                        message.request.params = {}
                    }
                    message.request.params.peerId = peerId
                }
                handlers.forEach(handler => handler(message))
            })
        },

        removeSource (peerId) {
            sources.delete(peerId)
        }
    }
}


function broadcastToSources (sources, message) {
    for (const peerTransport of sources.values()) {
        peerTransport.send(message)
    }
}
