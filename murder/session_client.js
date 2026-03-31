import ServiceClient from '../service/service_client.js'


export default class SessionClient extends ServiceClient {

    static $category = 'sessionClient'
    static $name = 'sessionClient'
    static $eagerStart = false

    constructor (options = {}) {
        super(options)
        this.peerId = options.peerId || null
    }


    async join () {
        return this.request('join', {peerId: this.peerId})
    }


    async sendInput (action, value) {
        return this.request('input', {peerId: this.peerId, action, value})
    }


    async sendMove (moveX) {
        return this.sendInput('move', moveX)
    }


    async ping () {
        const before = Date.now()
        const result = await this.request('ping')
        const rtt = Date.now() - before
        return {rtt, serverTime: result.serverTime}
    }

}
