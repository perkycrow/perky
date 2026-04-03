import ServiceClient from '../service/service_client.js'


export default class SessionClient extends ServiceClient {

    static $category = 'sessionClient'
    static $name = 'sessionClient'
    static $eagerStart = false

    constructor (options = {}) {
        super(options)
        this.peerId = options.peerId || null
        this.inputSeq = 0
    }


    async join () {
        return this.request('join', {peerId: this.peerId})
    }


    async sendInput (action, value) {
        this.inputSeq++
        return this.request('input', {peerId: this.peerId, action, value, seq: this.inputSeq})
    }


    async sendMove (moveX, moveY) {
        return this.sendInput('move', {x: moveX, y: moveY ?? 0})
    }


    async ping () {
        const before = Date.now()
        const result = await this.request('ping')
        const rtt = Date.now() - before
        return {rtt, serverTime: result.serverTime}
    }


    async reportStats (stats) {
        return this.request('reportStats', {peerId: this.peerId, ...stats})
    }


    async provideState (state) {
        return this.request('provideState', {peerId: this.peerId, state})
    }

}
