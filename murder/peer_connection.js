import PerkyModule from '../core/perky_module.js'


const DEFAULT_RTC_CONFIG = {
    iceServers: [{urls: 'stun:stun.l.google.com:19302'}]
}


export default class PeerConnection extends PerkyModule {

    static $category = 'peerConnection'
    static $eagerStart = false

    #connection = null
    #channel = null
    #pendingCandidates = []

    constructor (options = {}) {
        super(options)
        this.peerId = options.peerId
        this.rtcConfig = options.rtcConfig || DEFAULT_RTC_CONFIG
    }


    get channel () {
        return this.#channel
    }


    get connectionState () {
        if (!this.#connection) {
            return 'new'
        }
        return this.#connection.connectionState
    }


    get channelReady () {
        return this.#channel !== null && this.#channel.readyState === 'open'
    }


    async createOffer (sendSignal) {
        if (this.#connection) {
            return
        }

        this.#connection = createRTC(this)
        this.#channel = this.#connection.createDataChannel('game')
        setupChannel(this, this.#channel)

        await this.#connection.setLocalDescription()
        const offer = this.#connection.localDescription

        sendSignal({type: 'offer', to: this.peerId, payload: {type: offer.type, sdp: offer.sdp}})
    }


    async handleOffer (offer, sendSignal) {
        if (this.#connection) {
            return
        }

        this.#connection = createRTC(this)

        this.#connection.ondatachannel = (event) => {
            this.#channel = event.channel
            setupChannel(this, event.channel)
        }

        await this.#connection.setRemoteDescription(offer)
        this.#flushPendingCandidates()

        await this.#connection.setLocalDescription()
        const answer = this.#connection.localDescription

        sendSignal({type: 'answer', to: this.peerId, payload: {type: answer.type, sdp: answer.sdp}})
    }


    async handleAnswer (answer) {
        if (!this.#connection) {
            return
        }

        if (this.#connection.signalingState !== 'have-local-offer') {
            return
        }

        await this.#connection.setRemoteDescription(answer)
        this.#flushPendingCandidates()
    }


    handleIce (candidate) {
        if (!this.#connection) {
            return
        }

        if (!this.#connection.remoteDescription) {
            this.#pendingCandidates.push(candidate)
            return
        }

        this.#connection.addIceCandidate(candidate)
    }


    send (data) {
        if (!this.channelReady) {
            return false
        }

        this.#channel.send(JSON.stringify(data))
        return true
    }


    close () {
        if (this.#channel) {
            this.#channel.close()
            this.#channel = null
        }

        if (this.#connection) {
            this.#connection.close()
            this.#connection = null
        }

        this.#pendingCandidates = []
    }


    #flushPendingCandidates () {
        for (const candidate of this.#pendingCandidates) {
            this.#connection.addIceCandidate(candidate)
        }
        this.#pendingCandidates = []
    }


    onStop () {
        this.close()
    }

}


function createRTC (peer) {
    const connection = new RTCPeerConnection(peer.rtcConfig)

    connection.onicecandidate = (event) => {
        if (event.candidate) {
            peer.emit('ice', event.candidate)
        }
    }

    connection.onconnectionstatechange = () => {
        const state = connection.connectionState
        if (state === 'connected') {
            peer.emit('connected')
        } else if (state === 'disconnected' || state === 'failed') {
            peer.emit('disconnected')
        }
    }

    return connection
}


function setupChannel (peer, channel) {
    channel.onopen = () => peer.emit('channel:open')
    channel.onclose = () => peer.emit('channel:close')
    channel.onmessage = (event) => peer.emit('message', JSON.parse(event.data))
}
